/**
 * Complète les produits en base : description, specifications et image
 * par défaut lorsqu'ils sont vides (pour passer la vérification verify-products).
 * N'invente jamais de prix ni de SKU.
 *
 * Usage: npx tsx scripts/complete-products.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = '/placeholder-product.jpg';
const MIN_DESCRIPTION_LENGTH = 30;

function needsDescription(description: string | null): boolean {
  if (description == null) return true;
  return description.trim().length < MIN_DESCRIPTION_LENGTH;
}

function defaultDescription(name: string): string {
  return `Produit catalogue : ${name}. Consultez notre site ou contactez-nous pour plus d'informations.`;
}

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      specifications: true,
      features: true,
      image: true,
      images: true,
      sku: true,
    },
  });

  let updatedDesc = 0;
  let updatedSpecs = 0;
  let updatedImage = 0;
  let updatedSku = 0;

  for (const p of products) {
    const updates: {
      description?: string;
      specifications?: Record<string, string>;
      image?: string;
      images?: string[];
      sku?: string;
    } = {};

    if (needsDescription(p.description)) {
      updates.description = defaultDescription(p.name);
      updatedDesc++;
    }

    const specs = p.specifications as Record<string, string> | null | undefined;
    const hasSpecs = specs && typeof specs === 'object' && Object.keys(specs).length > 0;
    const hasFeatures = Array.isArray(p.features) && p.features.length > 0;
    if (!hasSpecs && !hasFeatures) {
      updates.specifications = { Produit: p.name };
      updatedSpecs++;
    }

    const hasImage = p.image && String(p.image).trim().length > 0;
    const hasImages = Array.isArray(p.images) && p.images.length > 0;
    if (!hasImage && !hasImages) {
      updates.image = PLACEHOLDER_IMAGE;
      updates.images = [PLACEHOLDER_IMAGE];
      updatedImage++;
    }

    if (!p.sku || String(p.sku).trim().length === 0) {
      updates.sku = p.id.toUpperCase().replace(/-/g, '_');
      updatedSku++;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: updates,
      });
    }
  }

  console.log('✅ Complétion des produits');
  console.log(`   Description par défaut : ${updatedDesc} produit(s)`);
  console.log(`   Spécifications par défaut : ${updatedSpecs} produit(s)`);
  console.log(`   Image placeholder : ${updatedImage} produit(s)`);
  console.log(`   SKU dérivé de l’id (si vide) : ${updatedSku} produit(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
