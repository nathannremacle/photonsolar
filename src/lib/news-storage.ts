import { prisma } from './prisma';
import type { NewsArticle as PrismaNewsArticle } from '@prisma/client';

// ==============================================
// Types
// ==============================================

export interface NewsArticle {
  id: number;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  link: string;
  content: string;
  image?: string;
  published?: boolean;
}

// ==============================================
// Helper functions
// ==============================================

/**
 * Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Convert Prisma NewsArticle to frontend NewsArticle type
 */
function prismaToNewsArticle(article: PrismaNewsArticle): NewsArticle {
  return {
    id: article.id,
    category: article.category,
    title: article.title,
    date: article.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    excerpt: article.excerpt,
    slug: article.slug,
    link: `/blogs/news/${article.slug}`,
    content: article.content,
    image: article.image || undefined,
    published: article.published,
  };
}

/**
 * Convert frontend NewsArticle to Prisma create/update data
 */
function articleToPrismaData(article: Omit<NewsArticle, 'id' | 'link'>) {
  return {
    category: article.category,
    title: article.title,
    slug: article.slug || generateSlug(article.title),
    date: new Date(article.date),
    excerpt: article.excerpt,
    content: article.content || article.excerpt,
    image: article.image || null,
    published: article.published ?? true,
  };
}

// ==============================================
// CRUD Operations
// ==============================================

/**
 * Load all news articles from database
 */
export async function loadNewsContent(): Promise<NewsArticle[]> {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { date: 'desc' },
    });
    return articles.map(prismaToNewsArticle);
  } catch (error) {
    console.error('Error loading news from database:', error);
    return [];
  }
}

/**
 * Load only published news articles
 */
export async function loadPublishedNews(): Promise<NewsArticle[]> {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
    });
    return articles.map(prismaToNewsArticle);
  } catch (error) {
    console.error('Error loading published news:', error);
    return [];
  }
}

/**
 * Get a single news article by slug
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const article = await prisma.newsArticle.findUnique({
      where: { slug },
    });
    return article ? prismaToNewsArticle(article) : null;
  } catch (error) {
    console.error('Error getting news article by slug:', error);
    return null;
  }
}

/**
 * Get a single news article by ID
 */
export async function getNewsArticleById(id: number): Promise<NewsArticle | null> {
  try {
    const article = await prisma.newsArticle.findUnique({
      where: { id },
    });
    return article ? prismaToNewsArticle(article) : null;
  } catch (error) {
    console.error('Error getting news article by ID:', error);
    return null;
  }
}

/**
 * Get news articles by IDs (for homepage selection)
 */
export async function getNewsArticlesByIds(ids: number[]): Promise<NewsArticle[]> {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { 
        id: { in: ids },
        published: true,
      },
    });
    
    // Maintain the order of the input IDs
    const articleMap = new Map(articles.map(a => [a.id, a]));
    return ids
      .map(id => articleMap.get(id))
      .filter((a): a is PrismaNewsArticle => a !== undefined)
      .map(prismaToNewsArticle);
  } catch (error) {
    console.error('Error getting news articles by IDs:', error);
    return [];
  }
}

/**
 * Create a new news article
 */
export async function createNewsArticle(article: Omit<NewsArticle, 'id' | 'link'>): Promise<NewsArticle> {
  try {
    const created = await prisma.newsArticle.create({
      data: articleToPrismaData(article),
    });
    return prismaToNewsArticle(created);
  } catch (error) {
    console.error('Error creating news article:', error);
    throw error;
  }
}

/**
 * Update an existing news article
 */
export async function updateNewsArticle(id: number, article: Partial<NewsArticle>): Promise<NewsArticle> {
  try {
    const updateData: any = {};
    
    if (article.category !== undefined) updateData.category = article.category;
    if (article.title !== undefined) updateData.title = article.title;
    if (article.slug !== undefined) updateData.slug = article.slug;
    if (article.date !== undefined) updateData.date = new Date(article.date);
    if (article.excerpt !== undefined) updateData.excerpt = article.excerpt;
    if (article.content !== undefined) updateData.content = article.content;
    if (article.image !== undefined) updateData.image = article.image || null;
    if (article.published !== undefined) updateData.published = article.published;
    
    const updated = await prisma.newsArticle.update({
      where: { id },
      data: updateData,
    });
    
    return prismaToNewsArticle(updated);
  } catch (error) {
    console.error('Error updating news article:', error);
    throw error;
  }
}

/**
 * Delete a news article
 */
export async function deleteNewsArticle(id: number): Promise<void> {
  try {
    await prisma.newsArticle.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting news article:', error);
    throw error;
  }
}

/**
 * Save all news articles (bulk replace) - for backward compatibility with admin panel
 */
export async function saveNewsContent(articles: NewsArticle[]): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // Get existing article IDs
      const existingArticles = await tx.newsArticle.findMany({
        select: { id: true },
      });
      const existingIds = new Set(existingArticles.map(a => a.id));
      
      // Determine which articles to delete
      const newArticleIds = new Set(articles.map(a => a.id));
      const toDelete = [...existingIds].filter(id => !newArticleIds.has(id));
      
      // Delete removed articles
      if (toDelete.length > 0) {
        await tx.newsArticle.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
      
      // Upsert all articles
      for (const article of articles) {
        const data = articleToPrismaData(article);
        
        if (article.id && existingIds.has(article.id)) {
          // Update existing
          await tx.newsArticle.update({
            where: { id: article.id },
            data,
          });
        } else {
          // Create new (let the database generate the ID)
          await tx.newsArticle.create({
            data,
          });
        }
      }
    });
  } catch (error) {
    console.error('Error saving news content:', error);
    throw error;
  }
}

/**
 * Get news article count
 */
export async function getNewsCount(): Promise<number> {
  try {
    return await prisma.newsArticle.count();
  } catch (error) {
    console.error('Error counting news articles:', error);
    return 0;
  }
}
