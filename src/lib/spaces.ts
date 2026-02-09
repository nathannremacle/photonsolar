import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
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

export { isSpacesConfigured, BUCKET as SPACES_BUCKET };
