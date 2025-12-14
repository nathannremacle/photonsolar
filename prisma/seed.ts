import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ==============================================
// HELPER FUNCTIONS
// ==============================================

function readJsonFile<T>(filePath: string): T | null {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return null;
}

// ==============================================
// INTERFACES (matching JSON structure)
// ==============================================

interface ProductJson {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price?: number;
  originalPrice?: number;
  sku?: string;
  description?: string;
  technicalDescription?: string;
  image?: string;
  images?: string[];
  link: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
  power?: string;
  type?: string;
  voltage?: string;
  features?: string[];
  specifications?: Record<string, string>;
  documentation?: {
    installationManual?: string;
    technicalSheet?: string;
    userGuide?: string;
  };
  mpptCount?: number;
  apparentPower?: string;
  nominalPower?: string;
  hasEthernet?: boolean;
  hasWiFi?: boolean;
  networkConnection?: string;
  cellType?: string;
  efficiency?: string;
  maxPower?: string;
  capacity?: string;
  batteryType?: string;
  cop?: string;
  heatingPower?: string;
  color?: string;
  material?: string;
}

interface HeroSlideJson {
  id: number;
  badge: string;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string;
}

interface PromotionJson {
  id: number;
  badge: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string;
}

interface SpecialOfferJson {
  id: number;
  title: string;
  description: string;
  features: string[];
  note?: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string;
}

interface BrandJson {
  name: string;
  link: string;
}

interface HomepageContentJson {
  metadata?: {
    title: string;
    description: string;
    keywords: string;
  };
  banner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  heroSlides: HeroSlideJson[];
  promotions: PromotionJson[];
  bestSellers: {
    enabled: boolean;
    productIds: string[];
  };
  clearance: {
    enabled: boolean;
    productIds: string[];
  };
  specialOffers: SpecialOfferJson[];
  news: {
    enabled: boolean;
    selectedIds: number[];
  };
  brands: {
    enabled: boolean;
    items: BrandJson[];
  };
}

interface NewsArticleJson {
  id: number;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  link: string;
  content: string;
  image?: string;
}

interface NewsContentJson {
  articles: NewsArticleJson[];
}

// ==============================================
// SEED FUNCTIONS
// ==============================================

async function seedProducts() {
  console.log('📦 Seeding products...');
  
  // Try JSON file first, then TS file
  let products: ProductJson[] = [];
  
  const jsonProducts = readJsonFile<ProductJson[]>('data/products.json');
  if (jsonProducts && jsonProducts.length > 0) {
    products = jsonProducts;
    console.log(`   Found ${products.length} products in data/products.json`);
  } else {
    // Try importing from TS file
    try {
      const productsModule = await import('../src/data/products');
      products = productsModule.products || [];
      console.log(`   Found ${products.length} products in src/data/products.ts`);
    } catch (error) {
      console.log('   No products found in either location');
    }
  }
  
  if (products.length === 0) {
    console.log('   ⚠️ No products to seed');
    return;
  }
  
  // Clear existing products
  await prisma.product.deleteMany();
  console.log('   Cleared existing products');
  
  // Insert products in batches for better performance
  const batchSize = 50;
  let inserted = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    await prisma.product.createMany({
      data: batch.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        subcategory: p.subcategory || null,
        price: p.price || null,
        originalPrice: p.originalPrice || null,
        sku: p.sku || null,
        description: p.description || null,
        technicalDescription: p.technicalDescription || null,
        image: p.image || (p.images && p.images[0]) || null,
        images: p.images || [],
        link: p.link || `/products/${p.id}`,
        weight: p.weight || null,
        dimensions: p.dimensions || null,
        warranty: p.warranty || null,
        power: p.power || null,
        type: p.type || null,
        voltage: p.voltage || null,
        features: p.features || [],
        specifications: p.specifications || null,
        documentation: p.documentation || null,
        mpptCount: p.mpptCount || null,
        apparentPower: p.apparentPower || null,
        nominalPower: p.nominalPower || null,
        hasEthernet: p.hasEthernet || null,
        hasWiFi: p.hasWiFi || null,
        networkConnection: p.networkConnection || null,
        cellType: p.cellType || null,
        efficiency: p.efficiency || null,
        maxPower: p.maxPower || null,
        capacity: p.capacity || null,
        batteryType: p.batteryType || null,
        cop: p.cop || null,
        heatingPower: p.heatingPower || null,
        color: p.color || null,
        material: p.material || null,
      })),
      skipDuplicates: true,
    });
    
    inserted += batch.length;
    console.log(`   Inserted ${inserted}/${products.length} products...`);
  }
  
  console.log(`   ✅ Seeded ${inserted} products`);
}

async function seedHomepageContent() {
  console.log('🏠 Seeding homepage content...');
  
  const content = readJsonFile<HomepageContentJson>('data/homepage-content.json');
  
  if (!content) {
    console.log('   ⚠️ No homepage content found');
    return;
  }
  
  // Seed SiteConfig
  console.log('   Creating site config...');
  await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: {
      metaTitle: content.metadata?.title || null,
      metaDescription: content.metadata?.description || null,
      metaKeywords: content.metadata?.keywords || null,
      bannerEnabled: content.banner?.enabled ?? true,
      bannerTitle: content.banner?.title || null,
      bannerSubtitle: content.banner?.subtitle || null,
      bannerCtaText: content.banner?.ctaText || null,
      bannerCtaLink: content.banner?.ctaLink || null,
      bestSellersEnabled: content.bestSellers?.enabled ?? true,
      bestSellersIds: content.bestSellers?.productIds || [],
      clearanceEnabled: content.clearance?.enabled ?? true,
      clearanceIds: content.clearance?.productIds || [],
      newsEnabled: content.news?.enabled ?? true,
      newsSelectedIds: content.news?.selectedIds || [],
      brandsEnabled: content.brands?.enabled ?? true,
    },
    create: {
      id: 'main',
      metaTitle: content.metadata?.title || null,
      metaDescription: content.metadata?.description || null,
      metaKeywords: content.metadata?.keywords || null,
      bannerEnabled: content.banner?.enabled ?? true,
      bannerTitle: content.banner?.title || null,
      bannerSubtitle: content.banner?.subtitle || null,
      bannerCtaText: content.banner?.ctaText || null,
      bannerCtaLink: content.banner?.ctaLink || null,
      bestSellersEnabled: content.bestSellers?.enabled ?? true,
      bestSellersIds: content.bestSellers?.productIds || [],
      clearanceEnabled: content.clearance?.enabled ?? true,
      clearanceIds: content.clearance?.productIds || [],
      newsEnabled: content.news?.enabled ?? true,
      newsSelectedIds: content.news?.selectedIds || [],
      brandsEnabled: content.brands?.enabled ?? true,
    },
  });
  console.log('   ✅ Site config created');
  
  // Seed Hero Slides
  console.log('   Creating hero slides...');
  await prisma.heroSlide.deleteMany();
  if (content.heroSlides && content.heroSlides.length > 0) {
    await prisma.heroSlide.createMany({
      data: content.heroSlides.map((slide, index) => ({
        order: index,
        badge: slide.badge,
        title: slide.title,
        description: slide.description,
        cta: slide.cta,
        ctaLink: slide.ctaLink,
        bgColor: slide.bgColor,
        backgroundImage: slide.backgroundImage || null,
      })),
    });
    console.log(`   ✅ Created ${content.heroSlides.length} hero slides`);
  }
  
  // Seed Promotions
  console.log('   Creating promotions...');
  await prisma.promotion.deleteMany();
  if (content.promotions && content.promotions.length > 0) {
    await prisma.promotion.createMany({
      data: content.promotions.map((promo, index) => ({
        order: index,
        badge: promo.badge,
        title: promo.title,
        description: promo.description,
        features: promo.features || [],
        cta: promo.cta,
        ctaLink: promo.ctaLink,
        bgColor: promo.bgColor,
        backgroundImage: promo.backgroundImage || null,
      })),
    });
    console.log(`   ✅ Created ${content.promotions.length} promotions`);
  }
  
  // Seed Special Offers
  console.log('   Creating special offers...');
  await prisma.specialOffer.deleteMany();
  if (content.specialOffers && content.specialOffers.length > 0) {
    await prisma.specialOffer.createMany({
      data: content.specialOffers.map((offer, index) => ({
        order: index,
        title: offer.title,
        description: offer.description,
        features: offer.features || [],
        note: offer.note || null,
        cta: offer.cta,
        ctaLink: offer.ctaLink,
        bgColor: offer.bgColor,
        backgroundImage: offer.backgroundImage || null,
      })),
    });
    console.log(`   ✅ Created ${content.specialOffers.length} special offers`);
  }
  
  // Seed Brands
  console.log('   Creating brands...');
  await prisma.brand.deleteMany();
  if (content.brands?.items && content.brands.items.length > 0) {
    await prisma.brand.createMany({
      data: content.brands.items.map((brand, index) => ({
        order: index,
        name: brand.name,
        link: brand.link,
      })),
    });
    console.log(`   ✅ Created ${content.brands.items.length} brands`);
  }
}

async function seedNewsArticles() {
  console.log('📰 Seeding news articles...');
  
  const newsContent = readJsonFile<NewsContentJson>('data/news-content.json');
  
  if (!newsContent || !newsContent.articles || newsContent.articles.length === 0) {
    console.log('   ⚠️ No news articles found');
    return;
  }
  
  await prisma.newsArticle.deleteMany();
  
  await prisma.newsArticle.createMany({
    data: newsContent.articles.map(article => ({
      category: article.category,
      title: article.title,
      slug: article.slug,
      date: new Date(article.date),
      excerpt: article.excerpt,
      content: article.content || article.excerpt,
      image: article.image || null,
      published: true,
    })),
  });
  
  console.log(`   ✅ Created ${newsContent.articles.length} news articles`);
}

// ==============================================
// MAIN SEED FUNCTION
// ==============================================

async function main() {
  console.log('🌱 Starting database seed...\n');
  console.log('='.repeat(50));
  
  try {
    // Seed in order of dependencies
    await seedProducts();
    console.log('');
    
    await seedNewsArticles();
    console.log('');
    
    await seedHomepageContent();
    console.log('');
    
    console.log('='.repeat(50));
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Your data has been migrated from JSON files to PostgreSQL.');
    console.log('You can now safely remove the data/ folder if desired.');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

