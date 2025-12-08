import { NextResponse } from 'next/server';
import { loadHomepageContent } from '@/lib/homepage-storage';

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

