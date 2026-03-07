import { NextRequest, NextResponse } from 'next/server';
import {
  isSpacesConfigured,
  uploadToSpaces,
  listSpacesKeys,
} from '@/lib/spaces';
import { requireAdminSession } from '@/lib/admin-auth-server';

const VALID_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

const MIME_TO_CONTENT_TYPE: Record<string, string> = {
  'image/jpg': 'image/jpeg',
  'image/jpeg': 'image/jpeg',
  'image/png': 'image/png',
  'image/gif': 'image/gif',
  'image/webp': 'image/webp',
  'image/svg+xml': 'image/svg+xml',
};

function getContentType(file: File): string {
  return MIME_TO_CONTENT_TYPE[file.type] ?? file.type ?? 'application/octet-stream';
}

/**
 * Find the next available image number for a product from existing keys in Spaces.
 */
async function findNextImageNumber(
  keyPrefix: string,
  sanitizedProductId: string,
  ext: string
): Promise<number> {
  const keys = await listSpacesKeys(keyPrefix);
  const baseName = `${sanitizedProductId}.${ext}`.toLowerCase();
  const baseExists = keys.some((k) => {
    const name = k.split('/').pop()?.toLowerCase();
    return name === baseName || name === `${sanitizedProductId}.jpg` || name === `${sanitizedProductId}.jpeg` || name === `${sanitizedProductId}.png` || name === `${sanitizedProductId}.gif` || name === `${sanitizedProductId}.webp`;
  });
  if (!baseExists) return 1;

  const pattern = new RegExp(`^.*/${sanitizedProductId}-(\\d+)\\.${ext}$`, 'i');
  const numbers: number[] = [];
  for (const k of keys) {
    const m = k.match(pattern);
    if (m) numbers.push(parseInt(m[1], 10));
  }
  if (numbers.length === 0) return 2;
  return Math.max(...numbers) + 1;
}

export async function POST(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    if (!isSpacesConfigured()) {
      return NextResponse.json(
        {
          error: 'Stockage non configuré',
          details: [
            'DigitalOcean Spaces n\'est pas configuré.',
            'Définissez les variables d\'environnement : DO_SPACES_KEY, DO_SPACES_SECRET, DO_SPACES_BUCKET, DO_SPACES_REGION, DO_SPACES_CDN_URL.',
          ].join('\n'),
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const productId = formData.get('productId') as string | null;
    const category = formData.get('category') as string | null;

    if (!files?.length) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    const uploadedFiles: string[] = [];
    const errors: string[] = [];
    const subdir = category ? `products/${category}` : 'products';
    const keyPrefix = `images/${subdir}`;

    let startingImageNumber = 1;
    let sanitizedProductId = '';
    let defaultExt = 'png';

    if (productId) {
      sanitizedProductId = productId.replace(/[^a-zA-Z0-9-]/g, '-');
      const firstFile = files.find((f) => VALID_MIME_TYPES.includes(f.type as any));
      if (firstFile) defaultExt = firstFile.name.split('.').pop()?.toLowerCase() || 'png';
      startingImageNumber = await findNextImageNumber(
        `${keyPrefix}/${sanitizedProductId}`,
        sanitizedProductId,
        defaultExt
      );
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (!VALID_MIME_TYPES.includes(file.type as any)) {
        errors.push(`Fichier "${file.name}": type non supporté (${file.type})`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        errors.push(
          `Fichier "${file.name}": trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB, max 10MB)`
        );
        continue;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || defaultExt;
      let filename: string;

      if (productId) {
        const imageNumber = startingImageNumber + index;
        if (imageNumber === 1 && index === 0) {
          filename = `${sanitizedProductId}.${ext}`;
        } else {
          filename = `${sanitizedProductId}-${imageNumber}.${ext}`;
        }
      } else {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        filename = `${timestamp}-${index}-${safeName}`;
      }

      const key = `${keyPrefix}/${filename}`;
      const contentType = getContentType(file);

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const url = await uploadToSpaces(key, buffer, contentType);
        uploadedFiles.push(url);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error(`Error uploading ${file.name}:`, err);
        errors.push(`Erreur lors de l'enregistrement de "${file.name}": ${message}`);
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        {
          error: "Aucune image valide n'a pu être uploadée",
          details: errors.length > 0 ? errors : ['Aucun fichier valide fourni'],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `${uploadedFiles.length} image(s) uploadée(s) avec succès`,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error: unknown) {
    console.error('Error uploading images:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    const stack = process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: "Erreur lors de l'upload des images",
        details: message,
        stack,
      },
      { status: 500 }
    );
  }
}
