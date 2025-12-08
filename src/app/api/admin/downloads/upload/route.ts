import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const PUBLIC_DOWNLOADS_DIR = join(process.cwd(), 'public/downloads');

export async function POST(request: NextRequest) {
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

    // Validate file type (only PDF)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF sont acceptés' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux (max 50MB)' },
        { status: 400 }
      );
    }

    // Create downloads directory if it doesn't exist
    if (!existsSync(PUBLIC_DOWNLOADS_DIR)) {
      await mkdir(PUBLIC_DOWNLOADS_DIR, { recursive: true });
    }

    // Generate filename
    const sanitizedFileName = fileName || file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = join(PUBLIC_DOWNLOADS_DIR, sanitizedFileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Calculate file size for display
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

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
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
}

