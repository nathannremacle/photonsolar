import { NextResponse } from 'next/server';
import { loadPublishedNews } from '@/lib/news-storage';

export async function GET() {
  try {
    // Load only published news for public API
    const articles = await loadPublishedNews();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error loading news:', error);
    return NextResponse.json(
      { error: 'Failed to load news' },
      { status: 500 }
    );
  }
}
