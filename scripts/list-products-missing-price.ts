import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prods = await prisma.product.findMany({
    where: { OR: [{ price: null }, { sku: null }] },
    select: { id: true, name: true, price: true, sku: true },
  });
  const out = path.join(process.cwd(), 'data', 'missing-price-sku.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(prods, null, 2), 'utf-8');
  console.log('Written', prods.length, 'products to', out);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
