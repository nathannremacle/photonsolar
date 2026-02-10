import { NextResponse } from 'next/server';
import { loadProducts } from '@/lib/products-storage';

/**
 * GET /api/products
 * 
 * Public API to get all products from database
 */
export async function GET() {
  try {
    const products = await loadProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
