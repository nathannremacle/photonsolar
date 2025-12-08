import { NextRequest, NextResponse } from 'next/server';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const PUBLIC_DOWNLOADS_DIR = join(process.cwd(), 'public/downloads');

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        { error: 'Nom de fichier requis' },
        { status: 400 }
      );
    }

    const filePath = join(PUBLIC_DOWNLOADS_DIR, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du fichier' },
      { status: 500 }
    );
  }
}

