import { NextResponse } from 'next/server';
import { loadProducts } from '@/lib/products-storage';
import { auth } from '@/auth';
import { getEffectivePricesForProducts } from '@/lib/pricing';
import type { UserRole } from '@prisma/client';

/**
 * GET /api/products
 *
 * Public API to get all products from database.
 * If the user is logged in, adds effectivePrice per product (role/user/company pricing).
 */
export async function GET() {
  try {
    const products = await loadProducts();
    const session = await auth();
    const context =
      session?.user?.id || session?.user?.role || session?.user?.companyName
        ? {
            userId: session.user?.id,
            companyName: session.user?.companyName ?? undefined,
            role: session.user?.role as UserRole | undefined,
          }
        : null;

    if (context) {
      const effectivePrices = await getEffectivePricesForProducts(
        products.map((p) => ({ id: p.id, price: p.price })),
        context
      );
      const productsWithPrice = products.map((p) => ({
        ...p,
        effectivePrice: effectivePrices.get(p.id) ?? p.price ?? null,
      }));
      return NextResponse.json({ products: productsWithPrice });
    }
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
