import { NextResponse } from 'next/server';
import { loadDownloadsContent } from '@/lib/downloads-storage';

export async function GET() {
  try {
    const content = loadDownloadsContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error loading downloads content:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du contenu' },
      { status: 500 }
    );
  }
}

