import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticleBySlug } from '@/lib/news-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await getNewsArticleBySlug(slug);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Only return published articles
    if (article.published === false) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error loading news article:', error);
    return NextResponse.json(
      { error: 'Failed to load news article' },
      { status: 500 }
    );
  }
}
