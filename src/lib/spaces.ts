import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CopyObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

const REGION = process.env.DO_SPACES_REGION ?? "fra1";
const ENDPOINT = process.env.DO_SPACES_ENDPOINT ?? `https://${REGION}.digitaloceanspaces.com`;
const BUCKET = process.env.DO_SPACES_BUCKET ?? "";
const CDN_BASE = process.env.DO_SPACES_CDN_URL ?? "";

function isSpacesConfigured(): boolean {
  return !!(
    process.env.DO_SPACES_KEY &&
    process.env.DO_SPACES_SECRET &&
    BUCKET &&
    CDN_BASE
  );
}

let client: S3Client | null = null;

/**
 * S3 client configured for DigitalOcean Spaces (region fra1 by default).
 * Uses DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_ENDPOINT (or built from DO_SPACES_REGION).
 */
export function getSpacesClient(): S3Client | null {
  if (!isSpacesConfigured()) return null;
  if (client) return client;
  client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
    forcePathStyle: false,
  });
  return client;
}

/**
 * Upload a file to Spaces with public-read ACL and correct ContentType.
 * Returns the CDN URL of the uploaded file.
 */
export async function uploadToSpaces(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const s3 = getSpacesClient();
  if (!s3 || !BUCKET || !CDN_BASE) {
    throw new Error("DigitalOcean Spaces is not configured (DO_SPACES_* env vars).");
  }

  const input: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ACL: "public-read",
    ContentType: contentType,
  };

  await s3.send(new PutObjectCommand(input));

  const base = CDN_BASE.replace(/\/$/, "");
  const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
  return `${base}/${normalizedKey}`;
}

/**
 * List object keys under a prefix (for computing next image number).
 */
export async function listSpacesKeys(prefix: string): Promise<string[]> {
  const s3 = getSpacesClient();
  if (!s3 || !BUCKET) return [];

  const out = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      MaxKeys: 1000,
    })
  );
  const keys = (out.Contents ?? []).map((o) => o.Key).filter((k): k is string => !!k);
  return keys;
}

/**
 * Build the CDN URL for a given key.
 */
export function getSpacesCdnUrl(key: string): string {
  const base = CDN_BASE.replace(/\/$/, "");
  const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
  return `${base}/${normalizedKey}`;
}

export interface SpacesImageFile {
  name: string;
  path: string;
  url: string;
  size?: number;
}

/**
 * List images in Spaces under prefix "images/" (or optional prefix).
 * Returns the same shape as the legacy filesystem scan for GET /api/admin/images.
 */
export async function listSpacesImages(prefix: string = "images/"): Promise<SpacesImageFile[]> {
  const s3 = getSpacesClient();
  if (!s3 || !BUCKET || !CDN_BASE) return [];

  const normalizedPrefix = prefix.startsWith("/") ? prefix.slice(1) : prefix;
  const out = await s3.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: normalizedPrefix,
      MaxKeys: 1000,
    })
  );

  const base = CDN_BASE.replace(/\/$/, "");
  const files: SpacesImageFile[] = [];

  for (const obj of out.Contents ?? []) {
    const key = obj.Key;
    if (!key || key.endsWith("/")) continue;
    const ext = key.toLowerCase().split(".").pop();
    if (!["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? "")) continue;

    const name = key.split("/").pop() ?? key;
    const path = key.startsWith("images/") ? key.replace(/^images\//, "") : key;
    const url = `${base}/${key}`;

    files.push({
      name,
      path,
      url,
      size: obj.Size,
    });
  }

  return files;
}

/**
 * Delete an object from Spaces by key (e.g. "images/products/onduleurs/file.png").
 */
export async function deleteFromSpaces(key: string): Promise<void> {
  const s3 = getSpacesClient();
  if (!s3 || !BUCKET) {
    throw new Error("DigitalOcean Spaces is not configured (DO_SPACES_* env vars).");
  }
  const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: normalizedKey,
    })
  );
}

/**
 * Extract the object key from a Spaces CDN URL, or null if not our CDN.
 */
export function getKeyFromSpacesUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const base = CDN_BASE.replace(/\/$/, "");
  const u = url.trim();
  if (!u.startsWith(base + "/") && u !== base) return null;
  const key = u.slice(base.length).replace(/^\//, "");
  return key || null;
}

/**
 * Upload a PDF (or any file) to Spaces under prefix "downloads/".
 * Returns the CDN URL. Use for admin download uploads.
 */
export async function uploadDownloadToSpaces(
  filename: string,
  body: Buffer,
  contentType: string = "application/pdf"
): Promise<string> {
  const key = `downloads/${filename}`;
  return uploadToSpaces(key, body, contentType);
}

/**
 * If the image URL points to an object under images/products/ without a category
 * subfolder (e.g. images/products/file.png), copy it to images/products/{category}/filename
 * and delete the original. Returns the new CDN URL. Otherwise returns the URL unchanged.
 */
export async function moveImageToCategory(imageUrl: string, category: string): Promise<string> {
  if (!isSpacesConfigured() || !category) return imageUrl;

  const key = getKeyFromSpacesUrl(imageUrl);
  if (!key) return imageUrl;

  const parts = key.split("/");
  // Only move if key is exactly "images/products/filename" (no category subfolder)
  if (parts[0] !== "images" || parts[1] !== "products" || parts.length !== 3) {
    return imageUrl;
  }

  const filename = parts[2];
  const newKey = `images/products/${category}/${filename}`;
  if (newKey === key) return imageUrl;

  const s3 = getSpacesClient();
  if (!s3 || !BUCKET) return imageUrl;

  const copySource = `${BUCKET}/${key}`;
  await s3.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: copySource,
      Key: newKey,
      ACL: "public-read",
    })
  );
  await deleteFromSpaces(key);
  return getSpacesCdnUrl(newKey);
}

export { isSpacesConfigured, BUCKET as SPACES_BUCKET };
