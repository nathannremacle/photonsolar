import { NextRequest, NextResponse } from 'next/server';
import { loadHomepageContent, saveHomepageContent, type HomepageContent } from '@/lib/homepage-storage';

export async function GET() {
  try {
    const content = loadHomepageContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error loading homepage content:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement du contenu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const content: HomepageContent = await request.json();
    saveHomepageContent(content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving homepage content:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du contenu' },
      { status: 500 }
    );
  }
}

