import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { isSpacesConfigured, listSpacesImages, deleteFromSpaces } from '@/lib/spaces';
import { requireAdminSession } from '@/lib/admin-auth-server';
import { prisma } from '@/lib/prisma';
import { loadProducts } from '@/lib/products-storage';
import { getHeroSlides, getPromotions, getSpecialOffers, getBrands } from '@/lib/homepage-storage';

const PUBLIC_IMAGES_DIR = join(process.cwd(), 'public/images');

export interface ImageFile {
  name: string;
  path: string;
  url: string;
  size?: number;
}

/** Normalize URL or path to a comparable key (e.g. "products/onduleurs/foo.png") */
function normalizeImageKey(urlOrPath: string): string {
  const u = urlOrPath.replace(/^https?:\/\/[^/]+/, '').trim();
  const idx = u.indexOf('images/');
  if (idx >= 0) return u.slice(idx + 7).split('?')[0].replace(/\/$/, '');
  return u.replace(/^\//, '').replace(/^images\//, '').split('?')[0];
}

export interface ImageUsageProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
}

export interface ImageUsageNews {
  id: number;
  title: string;
}

export interface ImageUsage {
  products: ImageUsageProduct[];
  heroSlides: number;
  promotions: number;
  specialOffers: number;
  brands: number;
  news: ImageUsageNews[];
}

/** Build a map: normalizedKey -> ImageUsage */
async function buildUsageMap(): Promise<Record<string, ImageUsage>> {
  const [products, heroSlides, promotions, specialOffers, brands, newsArticles] = await Promise.all([
    loadProducts(),
    getHeroSlides(),
    getPromotions(),
    getSpecialOffers(),
    getBrands(),
    prisma.newsArticle.findMany({ where: { published: true }, select: { id: true, title: true, image: true } }),
  ]);

  const map: Record<string, ImageUsage> = {};

  const add = (key: string, upd: Partial<ImageUsage>) => {
    if (!key) return;
    if (!map[key]) {
      map[key] = { products: [], heroSlides: 0, promotions: 0, specialOffers: 0, brands: 0, news: [] };
    }
    const m = map[key];
    if (upd.products?.length) m.products.push(...upd.products);
    if (upd.heroSlides) m.heroSlides += upd.heroSlides;
    if (upd.promotions) m.promotions += upd.promotions;
    if (upd.specialOffers) m.specialOffers += upd.specialOffers;
    if (upd.brands) m.brands += upd.brands;
    if (upd.news?.length) m.news.push(...upd.news);
  };

  for (const p of products) {
    const urls = [...new Set([p.image, ...(p.images || [])].filter(Boolean))] as string[];
    const info: ImageUsageProduct = { id: p.id, name: p.name, brand: p.brand, category: p.category };
    for (const url of urls) {
      add(normalizeImageKey(url), { products: [info] });
    }
  }
  heroSlides.forEach((s, i) => {
    if (s.backgroundImage) add(normalizeImageKey(s.backgroundImage), { heroSlides: 1 });
  });
  promotions.forEach((p, i) => {
    if (p.backgroundImage) add(normalizeImageKey(p.backgroundImage), { promotions: 1 });
  });
  specialOffers.forEach((o, i) => {
    if (o.backgroundImage) add(normalizeImageKey(o.backgroundImage), { specialOffers: 1 });
  });
  brands.forEach((b) => {
    if (b.name && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(b.name)) {
      add(normalizeImageKey(b.name), { brands: 1 });
    }
  });
  newsArticles.forEach((n) => {
    if (n.image) add(normalizeImageKey(n.image), { news: [{ id: n.id, title: n.title }] });
  });

  return map;
}

function scanImages(dir: string, basePath: string = ''): ImageFile[] {
  const images: ImageFile[] = [];
  
  if (!existsSync(dir)) {
    return images;
  }

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        images.push(...scanImages(fullPath, relativePath));
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
          const stats = statSync(fullPath);
          images.push({
            name: entry.name,
            path: relativePath,
            url: `/images/${relativePath}`,
            size: stats.size,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return images;
}

export async function GET(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const [images, usageMap] = await Promise.all([
      isSpacesConfigured() ? listSpacesImages('images/') : Promise.resolve(scanImages(PUBLIC_IMAGES_DIR)),
      buildUsageMap(),
    ]);

    const usage: Record<string, ImageUsage> = {};
    for (const img of images) {
      const key = normalizeImageKey(img.url);
      const fromPath = img.path.startsWith('images/') ? img.path.replace(/^images\//, '') : img.path;
      const u = usageMap[key] ?? usageMap[fromPath] ?? usageMap[img.path];
      if (u) usage[img.path] = u;
    }

    return NextResponse.json({ images, usage });
  } catch (error) {
    console.error('Error loading images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Chemin de l\'image requis' },
        { status: 400 }
      );
    }

    if (isSpacesConfigured()) {
      const key = imagePath.startsWith('images/') ? imagePath : `images/${imagePath}`;
      await deleteFromSpaces(key);
      return NextResponse.json({ success: true });
    }

    const fullPath = join(PUBLIC_IMAGES_DIR, imagePath);
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Image non trouvée' },
        { status: 404 }
      );
    }
    unlinkSync(fullPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'image' },
      { status: 500 }
    );
  }
}

