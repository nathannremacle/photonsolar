import { NextRequest, NextResponse } from 'next/server';
import { loadDownloadsContent, saveDownloadsContent, type DownloadsContent } from '@/lib/downloads-storage';

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

export async function POST(request: NextRequest) {
  try {
    const content: DownloadsContent = await request.json();
    saveDownloadsContent(content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving downloads content:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du contenu' },
      { status: 500 }
    );
  }
}

