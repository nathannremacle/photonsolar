/**
 * Script: Scrape products from photonsolar.be and sync to database.
 * - Removes all existing technical sheets (documentation.technicalSheet)
 * - Adds products from the site (or from data/products-photonsolar-be.json as fallback)
 * - No duplicates: check by SKU, then by name+brand
 * - Does not add any new technical sheet links
 *
 * Utilise le .env du projet pour DATABASE_URL (même base que le site).
 */

import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const BASE_URL = process.env.PRODUCTS_URL || 'https://www.photonsolar.be';
const DELAY_MS = parseInt(process.env.SCRAPE_DELAY_MS || '800', 10);

/**
 * Pages catégories photonsolar.be : le script parcourt ces URLs pour découvrir tous les produits.
 * Format: https://www.photonsolar.be/{id}-{slug} ou {id}--{slug}
 */
const CATEGORY_PAGE_URLS = [
  'https://www.photonsolar.be/',
  'https://www.photonsolar.be/10-panneaux-solaires',
  'https://www.photonsolar.be/11-onduleurs',
  'https://www.photonsolar.be/42--hybrid',
  'https://www.photonsolar.be/43-on-grid',
  'https://www.photonsolar.be/44-micro-onduleur',
  'https://www.photonsolar.be/12-batteries-stockage-',
  'https://www.photonsolar.be/15-batterie-plug-play-',
  'https://www.photonsolar.be/36-micro-onduleur-',
  'https://www.photonsolar.be/37-batterie-',
  'https://www.photonsolar.be/38-accessoires',
  'https://www.photonsolar.be/25-structure-de-montage',
  'https://www.photonsolar.be/33-toiture-incline',
  'https://www.photonsolar.be/34-toiture-plane-',
  'https://www.photonsolar.be/35-visseries',
  'https://www.photonsolar.be/14-pompe-a-chaleur-',
  'https://www.photonsolar.be/23-ballon-thermodynamique',
  'https://www.photonsolar.be/22-pompe-a-chaleur-piscine',
  'https://www.photonsolar.be/24-accessoires-chauffages',
  'https://www.photonsolar.be/13-borne-de-rechage',
  'https://www.photonsolar.be/40-electricite',
];

// Category name to slug mapping (from photonsolar.be to our schema)
const CATEGORY_MAP: Record<string, string> = {
  'panneaux': 'panneaux-solaires',
  'panneaux solaires': 'panneaux-solaires',
  'onduleurs': 'onduleurs',
  'plug&play': 'batterie-plug-play',
  'batteries': 'batteries-stockage',
  'borne': 'borne-recharge',
  'pompe à chaleur': 'pompe-chaleur',
  'pompe chaleur': 'pompe-chaleur',
  'ballon thermodynamique': 'pompe-chaleur',
  'climatiseur': 'climatiseur',
  'chauffage': 'pompe-chaleur',
  'accessoires': 'pompe-chaleur',
};

/**
 * Map URL path segment (e.g. 10-panneaux-solaires) to site categories.
 * Catégories du site: panneaux-solaires, onduleurs, batteries-stockage, structure-montage,
 * borne-recharge, pompe-chaleur, batterie-plug-play, poeles-cheminee, climatiseur.
 */
const URL_PATH_TO_CATEGORY: Record<string, { category: string; subcategory?: string }> = {
  'accueil': { category: 'structure-montage' },
  '10-panneaux-solaires': { category: 'panneaux-solaires' },
  '11-onduleurs': { category: 'onduleurs' },
  '42--hybrid': { category: 'onduleurs', subcategory: 'hybride' },
  '43-on-grid': { category: 'onduleurs', subcategory: 'on-grid' },
  '44-micro-onduleur': { category: 'onduleurs', subcategory: 'micro-onduleur' },
  '12-batteries-stockage-': { category: 'batteries-stockage' },
  '15-batterie-plug-play-': { category: 'batterie-plug-play' },
  '36-micro-onduleur-': { category: 'batterie-plug-play', subcategory: 'micro-onduleur' },
  '37-batterie-': { category: 'batterie-plug-play', subcategory: 'batterie' },
  '38-accessoires': { category: 'batterie-plug-play', subcategory: 'accessoires' },
  '25-structure-de-montage': { category: 'structure-montage' },
  '33-toiture-incline': { category: 'structure-montage', subcategory: 'toiture-inclinee' },
  '34-toiture-plane-': { category: 'structure-montage', subcategory: 'toiture-plane' },
  '35-visseries': { category: 'structure-montage', subcategory: 'visseries' },
  '14-pompe-a-chaleur-': { category: 'pompe-chaleur' },
  '23-ballon-thermodynamique': { category: 'pompe-chaleur', subcategory: 'ballon-thermodynamique' },
  '22-pompe-a-chaleur-piscine': { category: 'pompe-chaleur', subcategory: 'piscine' },
  '24-accessoires-chauffages': { category: 'pompe-chaleur', subcategory: 'accessoires' },
  '13-borne-de-rechage': { category: 'borne-recharge' },
  '40-electricite': { category: 'structure-montage', subcategory: 'electricite' },
};

interface ScrapedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price?: number;
  originalPrice?: number;
  sku?: string;
  description?: string;
  image?: string;
  images: string[];
  link: string;
  features: string[];
  specifications?: Record<string, string>;
  power?: string;
  nominalPower?: string;
  maxPower?: string;
  capacity?: string;
  heatingPower?: string;
  type?: string;
  [key: string]: unknown;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function resolveUrl(href: string, base: string): string {
  if (href.startsWith('http')) return href;
  const b = new URL(base);
  if (href.startsWith('//')) return b.protocol + href;
  if (href.startsWith('/')) return b.origin + href;
  return new URL(href, base).href;
}

/** Normalize image URL for dedup (strip query/hash). */
function normalizeImageUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return url;
  }
}

/** Remove duplicate images (same URL with or without query params). */
function deduplicateImages(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of urls) {
    const key = normalizeImageUrl(url);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(url);
  }
  return out;
}

/**
 * Remove all technical sheets from existing products (documentation.technicalSheet).
 * On charge tous les produits puis on filtre en JS pour ne pas dépendre du filtre JSON Prisma.
 */
async function removeTechnicalSheets(): Promise<number> {
  const products = await prisma.product.findMany({
    select: { id: true, documentation: true },
  });

  let updated = 0;
  for (const product of products) {
    const doc = product.documentation as Record<string, string> | null | undefined;
    if (doc && typeof doc === 'object' && 'technicalSheet' in doc && doc.technicalSheet) {
      const { technicalSheet: _, ...rest } = doc;
      const newDoc =
        Object.keys(rest).length > 0 ? rest : (Prisma.JsonNull as unknown as Prisma.InputJsonValue);
      await prisma.product.update({
        where: { id: product.id },
        data: { documentation: newDoc },
      });
      updated++;
    }
  }
  return updated;
}

/** Map scraped category/subcategory to site slugs (for fixing existing products). */
const CATEGORY_FIX_MAP: Record<string, string> = {
  'fixations': 'structure-montage',
};
const SUBCATEGORY_FIX_MAP: Record<string, string> = {
  'hybrid': 'hybride',
};

/**
 * Fix existing products: deduplicate images and map old category names to site categories.
 */
async function fixExistingProducts(): Promise<{ imagesFixed: number; categoryFixed: number }> {
  const products = await prisma.product.findMany({
    select: { id: true, images: true, category: true, subcategory: true },
  });
  let imagesFixed = 0;
  let categoryFixed = 0;
  for (const p of products) {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    const deduped = deduplicateImages(images);
    let newCategory = CATEGORY_FIX_MAP[p.category] ?? p.category;
    let newSub = p.subcategory ? (SUBCATEGORY_FIX_MAP[p.subcategory] ?? p.subcategory) : null;
    if (p.category === 'autres' && (p.subcategory === 'electricite' || !p.subcategory)) {
      newCategory = 'structure-montage';
      if (p.subcategory === 'electricite') newSub = 'electricite';
    }
    const needImages = deduped.length !== images.length;
    const needCategory = newCategory !== p.category || newSub !== (p.subcategory ?? null);
    if (needImages || needCategory) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          ...(needImages ? { image: deduped[0] || null, images: deduped } : {}),
          ...(needCategory ? { category: newCategory, subcategory: newSub } : {}),
        },
      });
      if (needImages) imagesFixed++;
      if (needCategory) categoryFixed++;
    }
  }
  return { imagesFixed, categoryFixed };
}

/**
 * Check if a product already exists by SKU, or by name+brand if no SKU.
 */
async function productExists(
  sku: string | null,
  name: string,
  brand: string
): Promise<boolean> {
  const existing = await findExistingProduct(sku, name, brand);
  return !!existing;
}

/**
 * Find existing product by SKU or by name+brand. Returns the product or null.
 */
async function findExistingProduct(
  sku: string | null,
  name: string,
  brand: string
): Promise<{ id: string } | null> {
  if (sku && sku.trim()) {
    const bySku = await prisma.product.findFirst({
      where: { sku: sku.trim() },
      select: { id: true },
    });
    if (bySku) return bySku;
  }
  const byNameBrand = await prisma.product.findFirst({
    where: { name, brand },
    select: { id: true },
  });
  return byNameBrand;
}

/**
 * Find existing product for update mode: by id (slug), then by SKU, then by name.
 * Used so we can re-edit products that were created with wrong brand/sku.
 */
async function findExistingForUpdate(p: ScrapedProduct): Promise<{ id: string } | null> {
  const byId = await prisma.product.findUnique({
    where: { id: p.id },
    select: { id: true },
  });
  if (byId) return byId;
  if (p.sku && p.sku.trim()) {
    const bySku = await prisma.product.findFirst({
      where: { sku: p.sku.trim() },
      select: { id: true },
    });
    if (bySku) return bySku;
  }
  const byName = await prisma.product.findFirst({
    where: { name: p.name },
    select: { id: true },
  });
  return byName;
}

/**
 * Fetch HTML from URL with simple rate limiting.
 */
async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; PhotonSolarSync/1.0; +https://github.com/photonsolar)',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Discover product URLs from a listing/category page.
 */
async function discoverProductUrls(listingUrl: string): Promise<string[]> {
  const html = await fetchHtml(listingUrl);
  const $ = cheerio.load(html);
  const links = new Set<string>();

  const baseOrigin = new URL(listingUrl).origin;

  // Product URL: .../category-id/ product-id-slug.html (e.g. /10-panneaux-solaires/45-panneau-...html)
  const productPageRegex = /\/\d+-[^/]+\.html$/;
  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    const full = resolveUrl(href, listingUrl);
    try {
      const u = new URL(full);
      if (!u.hostname.endsWith('photonsolar.be')) return;
      const pathOnly = u.pathname.replace(/#.*/, '').replace(/\?.*/, '');
      if (productPageRegex.test(pathOnly)) {
        links.add(u.origin + pathOnly);
      }
    } catch (_) {}
  });

  return [...links];
}

/** Load extra product URLs from env or data/scrape-extra-urls.txt (one URL per line). */
function loadExtraProductUrls(): string[] {
  const fromEnv = process.env.SCRAPE_EXTRA_URLS;
  if (fromEnv) {
    return fromEnv.split(/[\n,;]/).map((u) => u.trim()).filter(Boolean);
  }
  const filePath = path.join(process.cwd(), 'data', 'scrape-extra-urls.txt');
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter((u) => u && !u.startsWith('#'));
  }
  return [];
}

/** Extract key-value pairs from PrestaShop data sheet (dl/dt/dd, table, or .label/.value). */
function parseDataSheet($: cheerio.CheerioAPI): Record<string, string> {
  const out: Record<string, string> = {};
  // dl dt / dd
  $('dl.data-sheet dt, .product-features dt, [data-sheet] dt').each((_, dtEl) => {
    const key = $(dtEl).text().trim().replace(/\s*:\s*$/, '');
    const dd = $(dtEl).next('dd');
    if (key && dd.length) out[key] = dd.first().text().trim();
  });
  // table th / td
  $('table.data-sheet th, .product-features th, #product-details th').each((_, thEl) => {
    const key = $(thEl).text().trim().replace(/\s*:\s*$/, '');
    const td = $(thEl).next('td');
    if (key && td.length) out[key] = td.first().text().trim();
  });
  // .label + .value
  $('.label').each((_, el) => {
    const key = $(el).text().trim().replace(/\s*:\s*$/, '');
    const val = $(el).siblings('.value').first().text().trim() || $(el).next().text().trim();
    if (key && val) out[key] = val;
  });
  return out;
}

/**
 * Parse a single product page and return a ScrapedProduct (or null).
 * Extracts name, brand, price, SKU, description, specifications like the original catalog.
 */
async function scrapeProductPage(productUrl: string): Promise<ScrapedProduct | null> {
  try {
    const html = await fetchHtml(productUrl);
    const $ = cheerio.load(html);

    const dataSheet = parseDataSheet($);

    // Name: h1, normalized (trim, single spaces). PrestaShop often has "Product Type Brand Model"
    let name =
      $('h1.product-name, h1[itemprop="name"], h1.page-title, .product-detail-name, h1.h1').first().text().trim() ||
      $('h1').first().text().trim();
    if (!name || name.length < 3) return null;
    name = name.replace(/\s+/g, ' ').trim();

    // SKU: data sheet "Référence" first, then classic selectors
    const sku =
      dataSheet['Référence'] ||
      dataSheet['Reference'] ||
      $('.product-reference .value, [itemprop="sku"], .reference').first().text().trim() ||
      $('td').filter((_, el) => $(el).text().trim().toLowerCase().includes('référence')).first().next().text().trim() ||
      undefined;

    // Brand: data sheet "Marque" first, then block text "Marque X", then selectors
    let brand =
      dataSheet['Marque'] ||
      $('[itemprop="brand"], .product-brand, .manufacturer a, .product-manufacturer a').first().text().trim() ||
      $('a[href*="manufacturer"]').first().text().trim() ||
      '';
  // Fallback: text block like "Marque BEMCO Volume 250 L"
    if (!brand) {
      const block = $('.product-features, #product-details, [data-sheet]').first().text();
      const marqueMatch = block.match(/\bMarque\s+([A-Za-z0-9\s\-]+?)(?:\s+[A-Z][a-z]|\s*$)/);
      if (marqueMatch) brand = marqueMatch[1].trim();
    }
    if (!brand) brand = 'Photonsolar';

    // Category from URL path: /10-panneaux-solaires/45-panneau-....html
    let category = 'autres';
    let subcategory: string | undefined;
    try {
      const u = new URL(productUrl);
      const pathMatch = u.pathname.match(/^\/([^\/]+)\/\d+-/);
      if (pathMatch) {
        const pathCat = pathMatch[1].toLowerCase();
        const mapped = URL_PATH_TO_CATEGORY[pathCat];
        if (mapped) {
          category = mapped.category;
          subcategory = mapped.subcategory;
        } else {
          category = CATEGORY_MAP[pathCat.replace(/-/g, ' ')] || slugify(pathCat) || 'autres';
        }
      }
    } catch (_) {}
    // Fallback: breadcrumb
    if (category === 'autres') {
      const breadcrumbLinks = $('.breadcrumb a, .breadcrumb-item a, nav[aria-label="breadcrumb"] a');
      let categoryText = '';
      if (breadcrumbLinks.length > 1) {
        categoryText = breadcrumbLinks.eq(breadcrumbLinks.length - 2).text().trim();
      }
      if (!categoryText) {
        categoryText = $('a[href*="category"], .category-name').first().text().trim() || '';
      }
      category = CATEGORY_MAP[categoryText.toLowerCase()] || slugify(categoryText) || 'autres';
    }

    // Price: visible price, then data attribute, then meta / input (PrestaShop)
    let price: number | undefined;
    const priceEl = $('.product-price, [itemprop="price"], .current-price, .current-price-value').first();
    const priceText = priceEl.text().replace(/[^\d,.]/g, '').replace(',', '.');
    if (priceText) price = parseFloat(priceText);
    if (price == null || isNaN(price)) {
      const dataPrice = $('[data-product-price], .product-add-to-cart').attr('data-product-price') ||
        $('input[name="product_price"]').val() as string | undefined;
      if (dataPrice) price = parseFloat(String(dataPrice).replace(',', '.'));
    }
    if (price != null && isNaN(price)) price = undefined;

    // Description: tab content, then blocks (PrestaShop often uses #description or tab)
    let description =
      $('#description, #product-description, .product-description, [itemprop="description"], .description').first().text().trim() ||
      $('[id*="description"]').first().text().trim() ||
      '';
    if (!description) {
      $('.tab-pane, [role="tabpanel"]').each((_, el) => {
        const t = $(el).text().trim();
        if (t.length > description.length && t.length > 50) description = t;
      });
    }
    const descriptionClean = description.replace(/\s+/g, ' ').trim() || undefined;

    const mainImg =
      $('.product-cover img, .product-image img, [itemprop="image"]').first().attr('src') ||
      $('.product-images img').first().attr('src') ||
      '';
    const allImgs: string[] = [];
    $('.product-images img, .thumbnails img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) allImgs.push(resolveUrl(src, productUrl));
    });
    if (mainImg) allImgs.unshift(resolveUrl(mainImg, productUrl));
    const images = deduplicateImages(allImgs.length ? allImgs : mainImg ? [resolveUrl(mainImg, productUrl)] : []);
    const image = images[0] || undefined;

    const id = sku ? slugify(sku) : slugify(name);

    // Specifications from data sheet (same structure as original catalog)
    const specifications =
      Object.keys(dataSheet).length > 0 ? dataSheet : undefined;

    return {
      id,
      name,
      brand: brand || 'Photonsolar',
      category,
      subcategory,
      price,
      originalPrice: undefined,
      sku: sku || undefined,
      description: descriptionClean,
      image,
      images,
      link: `/products/${id}`,
      features: [],
      specifications,
    };
  } catch (e) {
    console.warn(`   ⚠ Failed to scrape ${productUrl}:`, (e as Error).message);
    return null;
  }
}

/**
 * Discover all product URLs by scraping each category page from CATEGORY_PAGE_URLS.
 */
async function scrapeFromUrl(): Promise<ScrapedProduct[]> {
  const allUrls = new Set<string>();

  for (let i = 0; i < CATEGORY_PAGE_URLS.length; i++) {
    const categoryUrl = CATEGORY_PAGE_URLS[i];
    try {
      await delay(200);
      const urls = await discoverProductUrls(categoryUrl);
      urls.forEach((u) => allUrls.add(u));
      if (urls.length > 0) {
        const label = categoryUrl.replace(BASE_URL, '') || '/';
        console.log(`   ${label}: ${urls.length} produit(s)`);
      }
    } catch (e) {
      console.warn(`   ⚠ ${categoryUrl}:`, (e as Error).message);
    }
  }

  const urls = [...allUrls];
  console.log(`   Total: ${urls.length} URL(s) produit unique(s)`);

  if (urls.length === 0) {
    console.log(`   ⚠️  Aucun produit trouvé. Utilisation du fichier JSON en secours...`);
    return [];
  }

  const products: ScrapedProduct[] = [];
  for (let i = 0; i < urls.length; i++) {
    await delay(DELAY_MS);
    const p = await scrapeProductPage(urls[i]);
    if (p) products.push(p);
    if ((i + 1) % 10 === 0) console.log(`   Scraped ${i + 1}/${urls.length}...`);
  }
  return products;
}

/**
 * Load products from data/products-photonsolar-be.json (no scraping).
 */
function loadFromJson(): ScrapedProduct[] {
  const filePath = path.join(process.cwd(), 'data', 'products-photonsolar-be.json');
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as ScrapedProduct[];
  return Array.isArray(data) ? data : [];
}

/**
 * Convert ScrapedProduct to Prisma create input (no documentation / technical sheet).
 */
function toPrismaProduct(p: ScrapedProduct) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory || null,
    price: p.price ?? null,
    originalPrice: p.originalPrice ?? null,
    sku: p.sku || null,
    description: p.description || null,
    technicalDescription: null,
    image: p.image || (p.images && p.images[0]) || null,
    images: deduplicateImages(p.images || []),
    link: p.link || `/products/${p.id}`,
    weight: null,
    dimensions: null,
    warranty: null,
    power: p.power || null,
    type: p.type || null,
    voltage: null,
    features: p.features || [],
    specifications: (p.specifications ?? Prisma.JsonNull) as Prisma.InputJsonValue,
    documentation: Prisma.JsonNull as unknown as Prisma.InputJsonValue,
    mpptCount: null,
    apparentPower: null,
    nominalPower: p.nominalPower || null,
    hasEthernet: null,
    hasWiFi: null,
    networkConnection: null,
    cellType: null,
    efficiency: null,
    maxPower: p.maxPower || null,
    capacity: p.capacity || null,
    batteryType: null,
    cop: null,
    heatingPower: p.heatingPower || null,
    color: null,
    material: null,
    outOfStock: false,
    hidden: false,
  };
}

async function main() {
  const source = process.argv.includes('--source=json') ? 'json' : 'scrape';
  const updateExisting = process.argv.includes('--update-existing');
  console.log('🔄 PhotonSolar product sync');
  console.log('   Source:', source);
  if (updateExisting) console.log('   Mode: mise à jour des produits existants (ré-édition)');
  console.log('');

  // 1) Remove all technical sheets
  const totalInDb = await prisma.product.count();
  console.log(`📊 Produits actuellement en base: ${totalInDb}`);
  console.log('📄 Suppression des fiches techniques (documentation.technicalSheet)...');
  const removed = await removeTechnicalSheets();
  console.log(`   Fiches techniques supprimées: ${removed} produit(s).`);
  console.log('🔧 Correction des produits existants (images dédupliquées, catégories mappées)...');
  const { imagesFixed, categoryFixed } = await fixExistingProducts();
  console.log(`   Images dédupliquées: ${imagesFixed} produit(s), Catégories corrigées: ${categoryFixed} produit(s).`);
  console.log('');

  let products: ScrapedProduct[];

  if (source === 'json') {
    products = loadFromJson();
    console.log(`📦 Loaded ${products.length} products from data/products-photonsolar-be.json`);
  } else {
    console.log(`🕷 Découverte des produits via les pages catégories photonsolar.be...`);
    try {
      products = await scrapeFromUrl();
      if (products.length === 0) {
        console.log(`   ⚠️  No products scraped from live site, using JSON fallback...`);
        products = loadFromJson();
        console.log(`   Using ${products.length} products from data/products-photonsolar-be.json`);
      }
    } catch (e) {
      console.warn('   Scrape failed, falling back to JSON:', (e as Error).message);
      products = loadFromJson();
      console.log(`   Using ${products.length} products from data/products-photonsolar-be.json`);
    }
  }

  if (products.length === 0) {
    console.log('   No products to sync. Exiting.');
    return;
  }

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = updateExisting
      ? await findExistingForUpdate(p)
      : await findExistingProduct(p.sku || null, p.name, p.brand).then((r) => r ?? null);
    const exists = !!existing;
    if (exists) {
      if (updateExisting) {
        try {
          const data = toPrismaProduct(p);
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: data.name,
              brand: data.brand,
              category: data.category,
              subcategory: data.subcategory,
              price: data.price,
              originalPrice: data.originalPrice,
              sku: data.sku,
              description: data.description,
              image: data.image,
              images: data.images,
              link: data.link,
              features: data.features,
              specifications: data.specifications,
              power: data.power,
              type: data.type,
              nominalPower: data.nominalPower,
              maxPower: data.maxPower,
              capacity: data.capacity,
              heatingPower: data.heatingPower,
            },
          });
          updated++;
        } catch (err) {
          console.warn(`   Update "${p.name}":`, (err as Error).message);
        }
      } else {
        skipped++;
      }
      continue;
    }
    try {
      await prisma.product.create({
        data: toPrismaProduct(p),
      });
      inserted++;
    } catch (err) {
      if ((err as { code?: string }).code === 'P2002') {
        skipped++;
      } else {
        console.warn(`   Skip product "${p.name}":`, (err as Error).message);
      }
    }
  }

  const finalCount = await prisma.product.count();
  console.log('');
  console.log('✅ Terminé');
  console.log(`   Insérés: ${inserted}`);
  if (updateExisting) console.log(`   Mis à jour: ${updated}`);
  console.log(`   Ignorés (doublons): ${skipped}`);
  console.log(`   Total en base: ${finalCount}`);
  console.log('');
  console.log('💡 Le site lit la même base (DATABASE_URL). Aucune action supplémentaire nécessaire.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
