import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireAdminSession } from '@/lib/admin-auth';
import { isSpacesConfigured, uploadDownloadToSpaces } from '@/lib/spaces';

const PUBLIC_DOWNLOADS_DIR = join(process.cwd(), 'public/downloads');

export async function POST(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF sont acceptés' },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 50MB)' },
        { status: 400 }
      );
    }

    const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    if (isSpacesConfigured()) {
      const url = await uploadDownloadToSpaces(sanitizedFileName, buffer, 'application/pdf');
      return NextResponse.json({
        success: true,
        file: {
          name: sanitizedFileName,
          path: url,
          size: `${fileSizeMB} MB`,
          format: 'PDF',
        },
      });
    }

    if (!existsSync(PUBLIC_DOWNLOADS_DIR)) {
      await mkdir(PUBLIC_DOWNLOADS_DIR, { recursive: true });
    }
    const filePath = join(PUBLIC_DOWNLOADS_DIR, sanitizedFileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      file: {
        name: sanitizedFileName,
        path: `/downloads/${sanitizedFileName}`,
        size: `${fileSizeMB} MB`,
        format: 'PDF',
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
