import { NextRequest, NextResponse } from 'next/server';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { requireAdminSession } from '@/lib/admin-auth-server';
import { isSpacesConfigured, deleteFromSpaces, getKeyFromSpacesUrl } from '@/lib/spaces';

const PUBLIC_DOWNLOADS_DIR = join(process.cwd(), 'public/downloads');

export async function DELETE(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const filePathOrUrl = searchParams.get('path'); // optional: full CDN URL for Spaces

    if (!fileName && !filePathOrUrl) {
      return NextResponse.json(
        { error: 'Nom de fichier ou path requis' },
        { status: 400 }
      );
    }

    if (isSpacesConfigured() && (filePathOrUrl || fileName)) {
      let key: string;
      if (filePathOrUrl && getKeyFromSpacesUrl(filePathOrUrl)) {
        key = getKeyFromSpacesUrl(filePathOrUrl)!;
      } else {
        key = `downloads/${fileName}`;
      }
      await deleteFromSpaces(key);
      return NextResponse.json({ success: true });
    }

    const name = fileName || (filePathOrUrl && filePathOrUrl.split('/').pop()) || '';
    if (!name) {
      return NextResponse.json(
        { error: 'Nom de fichier requis' },
        { status: 400 }
      );
    }
    const filePath = join(PUBLIC_DOWNLOADS_DIR, name);

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

