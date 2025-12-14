import { NextRequest, NextResponse } from 'next/server';
import { loadNewsContent, saveNewsContent, type NewsArticle } from '@/lib/news-storage';

export async function GET() {
  try {
    const articles = await loadNewsContent();
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error loading news:', error);
    return NextResponse.json(
      { error: 'Failed to load news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articles } = body;

    if (!Array.isArray(articles)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    await saveNewsContent(articles);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving news:', error);
    return NextResponse.json(
      { error: 'Failed to save news' },
      { status: 500 }
    );
  }
}
