/**
 * Applique les prix et SKU issus des recherches internet (data/product-price-sku-overrides.json).
 * Chaque entrée : { "product-id": { "price": number, "sku": string } }
 * 
 * Usage: npx tsx scripts/apply-price-sku-from-web.ts
 */

import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OVERRIDES_PATH = path.join(process.cwd(), 'data', 'product-price-sku-overrides.json');

async function main() {
  if (!fs.existsSync(OVERRIDES_PATH)) {
    console.log('Fichier non trouvé:', OVERRIDES_PATH);
    console.log('Créez un fichier JSON avec les clés product id et les valeurs { price?: number, sku?: string }');
    return;
  }

  const raw = fs.readFileSync(OVERRIDES_PATH, 'utf-8');
  const overrides = JSON.parse(raw) as Record<string, { price?: number; sku?: string }>;

  let updated = 0;
  let errors = 0;

  for (const [id, data] of Object.entries(overrides)) {
    if (!data || (data.price == null && !data.sku)) continue;
    const update: { price?: number | null; sku?: string | null } = {};
    if (typeof data.price === 'number' && data.price > 0) update.price = data.price;
    if (typeof data.sku === 'string' && data.sku.trim()) update.sku = data.sku.trim();
    if (Object.keys(update).length === 0) continue;

    try {
      await prisma.product.update({
        where: { id },
        data: update,
      });
      updated++;
      if (update.price != null) console.log(`  [${id}] price=${update.price}${update.sku ? ` sku=${update.sku}` : ''}`);
    } catch (e) {
      errors++;
      console.warn(`  ⚠ [${id}]:`, (e as Error).message);
    }
  }

  console.log('\n✅ Terminé');
  console.log(`   Mis à jour: ${updated} produit(s)`);
  if (errors) console.log(`   Erreurs: ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
