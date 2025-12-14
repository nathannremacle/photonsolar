import { NextRequest, NextResponse } from 'next/server';
import { loadHomepageContent, saveHomepageContent, type HomepageContent, type NewsItem } from '@/lib/homepage-storage';
import { loadNewsContent } from '@/lib/news-storage';

export async function GET() {
  try {
    const content = await loadHomepageContent();
    
    // Load news from centralized storage and filter by selectedIds
    if (content.news?.enabled && content.news.selectedIds && content.news.selectedIds.length > 0) {
      const allNews = await loadNewsContent();
      const selectedNews: NewsItem[] = allNews
        .filter(article => content.news.selectedIds.includes(article.id))
        .map(article => ({
          id: article.id,
          category: article.category,
          title: article.title,
          date: article.date,
          image: article.image || '/placeholder-news.jpg',
          link: article.link,
          excerpt: article.excerpt,
        }));
      
      // Update content with selected news items for preview
      content.news = {
        ...content.news,
        items: selectedNews,
      };
    } else if (content.news) {
      // If no selectedIds, set empty items
      content.news = {
        ...content.news,
        items: [],
      };
    }
    
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
    await saveHomepageContent(content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving homepage content:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde du contenu' },
      { status: 500 }
    );
  }
}
