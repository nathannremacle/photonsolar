/**
 * Script: Vérifier combien de produits sont dans la base vs combien devraient être scrapés
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification des produits...\n');

  // Compter les produits dans la base
  const dbCount = await prisma.product.count();
  console.log(`📊 Produits dans la base de données: ${dbCount}`);

  // Compter les produits dans le JSON
  const jsonPath = path.join(process.cwd(), 'data', 'products-photonsolar-be.json');
  let jsonCount = 0;
  if (fs.existsSync(jsonPath)) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const products = JSON.parse(jsonContent);
    jsonCount = Array.isArray(products) ? products.length : 0;
    console.log(`📄 Produits dans data/products-photonsolar-be.json: ${jsonCount}`);
  } else {
    console.log(`⚠️  Fichier data/products-photonsolar-be.json introuvable`);
  }

  // Lister quelques produits de la base pour vérification
  const sampleProducts = await prisma.product.findMany({
    take: 10,
    select: { id: true, name: true, brand: true, category: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📦 Exemples de produits dans la base (10 derniers):`);
  sampleProducts.forEach((p, i) => {
    console.log(`   ${i + 1}. [${p.category}] ${p.brand} - ${p.name}`);
  });

  // Compter par catégorie
  const byCategory = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
  });

  console.log(`\n📊 Produits par catégorie:`);
  byCategory.forEach((cat) => {
    console.log(`   ${cat.category}: ${cat._count.id}`);
  });

  console.log(`\n✅ Vérification terminée`);
  console.log(`\n💡 Pour scraper les produits manquants:`);
  console.log(`   npm run scrape:products -- --source=json`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
