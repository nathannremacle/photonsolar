import { prisma } from './prisma';
import type {
  SiteConfig as PrismaSiteConfig,
  HeroSlide as PrismaHeroSlide,
  Promotion as PrismaPromotion,
  SpecialOffer as PrismaSpecialOffer,
  Brand as PrismaBrand,
} from '@prisma/client';

// ==============================================
// Types (matching frontend expectations)
// ==============================================

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string;
}

export interface Promotion {
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

export interface SpecialOffer {
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

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  date: string;
  image: string;
  link: string;
  excerpt?: string;
}

export interface Brand {
  name: string;
  link: string;
}

export interface HomepageContent {
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
  heroSlides: HeroSlide[];
  promotions: Promotion[];
  bestSellers: {
    enabled: boolean;
    productIds: string[];
  };
  clearance: {
    enabled: boolean;
    productIds: string[];
  };
  specialOffers: SpecialOffer[];
  news: {
    enabled: boolean;
    selectedIds: number[];
    items?: NewsItem[];
  };
  brands: {
    enabled: boolean;
    items: Brand[];
  };
}

// ==============================================
// Conversion helpers
// ==============================================

function prismaToHeroSlide(slide: PrismaHeroSlide): HeroSlide {
  return {
    id: slide.id,
    badge: slide.badge,
    title: slide.title,
    description: slide.description,
    cta: slide.cta,
    ctaLink: slide.ctaLink,
    bgColor: slide.bgColor,
    backgroundImage: slide.backgroundImage || undefined,
  };
}

function prismaToPromotion(promo: PrismaPromotion): Promotion {
  return {
    id: promo.id,
    badge: promo.badge,
    title: promo.title,
    description: promo.description,
    features: promo.features,
    cta: promo.cta,
    ctaLink: promo.ctaLink,
    bgColor: promo.bgColor,
    backgroundImage: promo.backgroundImage || undefined,
  };
}

function prismaToSpecialOffer(offer: PrismaSpecialOffer): SpecialOffer {
  return {
    id: offer.id,
    title: offer.title,
    description: offer.description,
    features: offer.features,
    note: offer.note || undefined,
    cta: offer.cta,
    ctaLink: offer.ctaLink,
    bgColor: offer.bgColor,
    backgroundImage: offer.backgroundImage || undefined,
  };
}

function prismaToBrand(brand: PrismaBrand): Brand {
  return {
    name: brand.name,
    link: brand.link,
  };
}

// ==============================================
// Default content (for initial setup)
// ==============================================

const defaultContent: HomepageContent = {
  metadata: {
    title: "Photon Solar - L'énergie solaire pour votre avenir | Belgique",
    description: "Photon Solar, expert en énergie solaire en Belgique depuis 2008.",
    keywords: "panneaux solaires, photovoltaïque, énergie solaire, Belgique",
  },
  banner: {
    enabled: true,
    title: "Bienvenue chez Photon Solar",
    subtitle: "Votre spécialiste en énergie solaire depuis 2008",
    ctaText: "Voir le catalogue",
    ctaLink: "/collections",
  },
  heroSlides: [],
  promotions: [],
  bestSellers: {
    enabled: true,
    productIds: [],
  },
  clearance: {
    enabled: true,
    productIds: [],
  },
  specialOffers: [],
  news: {
    enabled: true,
    selectedIds: [],
  },
  brands: {
    enabled: true,
    items: [],
  },
};

// ==============================================
// Load homepage content from database
// ==============================================

export async function loadHomepageContent(): Promise<HomepageContent> {
  try {
    // Load all content in parallel
    const [siteConfig, heroSlides, promotions, specialOffers, brands] = await Promise.all([
      prisma.siteConfig.findUnique({ where: { id: 'main' } }),
      prisma.heroSlide.findMany({ orderBy: { order: 'asc' } }),
      prisma.promotion.findMany({ orderBy: { order: 'asc' } }),
      prisma.specialOffer.findMany({ orderBy: { order: 'asc' } }),
      prisma.brand.findMany({ orderBy: { order: 'asc' } }),
    ]);

    // If no site config exists, return defaults
    if (!siteConfig) {
      return defaultContent;
    }

    return {
      metadata: {
        title: siteConfig.metaTitle || defaultContent.metadata!.title,
        description: siteConfig.metaDescription || defaultContent.metadata!.description,
        keywords: siteConfig.metaKeywords || defaultContent.metadata!.keywords,
      },
      banner: {
        enabled: siteConfig.bannerEnabled,
        title: siteConfig.bannerTitle || '',
        subtitle: siteConfig.bannerSubtitle || '',
        ctaText: siteConfig.bannerCtaText || '',
        ctaLink: siteConfig.bannerCtaLink || '',
      },
      heroSlides: heroSlides.map(prismaToHeroSlide),
      promotions: promotions.map(prismaToPromotion),
      bestSellers: {
        enabled: siteConfig.bestSellersEnabled,
        productIds: siteConfig.bestSellersIds,
      },
      clearance: {
        enabled: siteConfig.clearanceEnabled,
        productIds: siteConfig.clearanceIds,
      },
      specialOffers: specialOffers.map(prismaToSpecialOffer),
      news: {
        enabled: siteConfig.newsEnabled,
        selectedIds: siteConfig.newsSelectedIds,
      },
      brands: {
        enabled: siteConfig.brandsEnabled,
        items: brands.map(prismaToBrand),
      },
    };
  } catch (error) {
    console.error('Error loading homepage content from database:', error);
    return defaultContent;
  }
}

// ==============================================
// Save homepage content to database
// ==============================================

export async function saveHomepageContent(content: HomepageContent): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Upsert SiteConfig
      await tx.siteConfig.upsert({
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

      // 2. Replace Hero Slides
      await tx.heroSlide.deleteMany();
      if (content.heroSlides && content.heroSlides.length > 0) {
        await tx.heroSlide.createMany({
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
      }

      // 3. Replace Promotions
      await tx.promotion.deleteMany();
      if (content.promotions && content.promotions.length > 0) {
        await tx.promotion.createMany({
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
      }

      // 4. Replace Special Offers
      await tx.specialOffer.deleteMany();
      if (content.specialOffers && content.specialOffers.length > 0) {
        await tx.specialOffer.createMany({
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
      }

      // 5. Replace Brands
      await tx.brand.deleteMany();
      if (content.brands?.items && content.brands.items.length > 0) {
        await tx.brand.createMany({
          data: content.brands.items.map((brand, index) => ({
            order: index,
            name: brand.name,
            link: brand.link,
          })),
        });
      }
    });
  } catch (error) {
    console.error('Error saving homepage content to database:', error);
    throw error;
  }
}

// ==============================================
// Individual section getters (for optimization)
// ==============================================

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
    return slides.map(prismaToHeroSlide);
  } catch (error) {
    console.error('Error loading hero slides:', error);
    return [];
  }
}

export async function getPromotions(): Promise<Promotion[]> {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { order: 'asc' },
    });
    return promotions.map(prismaToPromotion);
  } catch (error) {
    console.error('Error loading promotions:', error);
    return [];
  }
}

export async function getSpecialOffers(): Promise<SpecialOffer[]> {
  try {
    const offers = await prisma.specialOffer.findMany({
      orderBy: { order: 'asc' },
    });
    return offers.map(prismaToSpecialOffer);
  } catch (error) {
    console.error('Error loading special offers:', error);
    return [];
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { order: 'asc' },
    });
    return brands.map(prismaToBrand);
  } catch (error) {
    console.error('Error loading brands:', error);
    return [];
  }
}

export async function getSiteConfig(): Promise<PrismaSiteConfig | null> {
  try {
    return await prisma.siteConfig.findUnique({
      where: { id: 'main' },
    });
  } catch (error) {
    console.error('Error loading site config:', error);
    return null;
  }
}
