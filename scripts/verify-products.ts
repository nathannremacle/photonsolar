/**
 * Vérification des produits en base : chaque produit est comparé à la structure
 * des "premiers" produits (src/data/products.ts) pour détecter les champs
 * manquants ou incohérents (prix, SKU, description, image, specs/features, marque).
 *
 * Utilise le .env du projet pour DATABASE_URL.
 *
 * Usage: npx tsx scripts/verify-products.ts [--json]
 *   --json  Sortie machine (JSON) au lieu du rapport console.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Critères alignés sur les premiers produits (products.ts) : ce qu'on attend pour un produit "complet". */
const CRITERIA = {
  /** Prix renseigné et > 0 (obligatoire pour vente). */
  price: (p: { price?: number | null }) =>
    typeof p.price === 'number' && p.price > 0,

  /** Référence / SKU présente (identification catalogue). */
  sku: (p: { sku?: string | null }) =>
    typeof p.sku === 'string' && p.sku.trim().length > 0,

  /** Description texte présente et un minimum significatif (comme les fiches manuelles). */
  description: (p: { description?: string | null }) =>
    typeof p.description === 'string' && p.description.trim().length >= 30,

  /** Au moins une image (principale ou galerie). */
  image: (p: { image?: string | null; images?: unknown }) => {
    if (typeof p.image === 'string' && p.image.trim().length > 0) return true;
    const imgs = p.images;
    return Array.isArray(imgs) && imgs.length > 0 && typeof imgs[0] === 'string';
  },

  /** Spécifications (objet clé/valeur) ou au moins une feature (comme les premiers produits). */
  specsOrFeatures: (p: {
    specifications?: unknown;
    features?: unknown;
  }) => {
    const specs = p.specifications;
    if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
      const keys = Object.keys(specs as Record<string, unknown>);
      if (keys.length > 0) return true;
    }
    const feats = p.features;
    return Array.isArray(feats) && feats.length > 0;
  },

  /** Marque autre que le fallback "Photonsolar" (indicateur possible de donnée non trouvée). */
  brandNotFallback: (p: { brand: string }) =>
    p.brand.trim().toLowerCase() !== 'photonsolar',
} as const;

type CriteriaKey = keyof typeof CRITERIA;

interface ProductCheck {
  id: string;
  name: string;
  brand: string;
  category: string;
  ok: boolean;
  missing: CriteriaKey[];
  warnings: string[];
}

function checkProduct(p: {
  id: string;
  name: string;
  brand: string;
  category: string;
  price?: number | null;
  sku?: string | null;
  description?: string | null;
  image?: string | null;
  images?: unknown;
  specifications?: unknown;
  features?: unknown;
}): ProductCheck {
  const missing: CriteriaKey[] = [];
  const warnings: string[] = [];

  for (const [key, fn] of Object.entries(CRITERIA) as [CriteriaKey, (p: unknown) => boolean][]) {
    if (!fn(p)) {
      if (key === 'brandNotFallback') {
        warnings.push('Marque = Photonsolar (possible fallback si non trouvée sur la page)');
      } else {
        missing.push(key);
      }
    }
  }

  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    ok: missing.length === 0,
    missing,
    warnings,
  };
}

async function main() {
  const outJson = process.argv.includes('--json');

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      brand: true,
      category: true,
      price: true,
      sku: true,
      description: true,
      image: true,
      images: true,
      specifications: true,
      features: true,
    },
  });

  const results: ProductCheck[] = products.map((p) => checkProduct(p));
  const ok = results.filter((r) => r.ok);
  const incomplete = results.filter((r) => !r.ok);

  if (outJson) {
    console.log(
      JSON.stringify(
        {
          total: products.length,
          ok: ok.length,
          incomplete: incomplete.length,
          products: results,
        },
        null,
        2
      )
    );
    return;
  }

  // Rapport console
  console.log('🔍 Vérification des produits (structure type premiers produits)\n');
  console.log(`   Total: ${products.length}`);
  console.log(`   Complets (tous critères OK): ${ok.length}`);
  console.log(`   Incomplets ou à vérifier: ${incomplete.length}\n`);

  if (incomplete.length === 0) {
    console.log('✅ Tous les produits respectent les critères.\n');
    return;
  }

  console.log('--- Produits incomplets (champs manquants ou à compléter) ---\n');

  for (const r of incomplete) {
    const missingStr = r.missing.join(', ');
    const warnStr = r.warnings.length ? ` | ${r.warnings.join('; ')}` : '';
    console.log(`  [${r.id}] ${r.name}`);
    console.log(`      Catégorie: ${r.category} | Marque: ${r.brand}`);
    console.log(`      Manque: ${missingStr}${warnStr}`);
    console.log('');
  }

  // Résumé par critère
  const byMissing: Record<string, number> = {};
  for (const r of incomplete) {
    for (const m of r.missing) {
      byMissing[m] = (byMissing[m] ?? 0) + 1;
    }
  }
  console.log('--- Résumé par critère manquant ---');
  for (const [key, count] of Object.entries(byMissing).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${key}: ${count} produit(s)`);
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
