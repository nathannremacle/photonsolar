import { NextRequest, NextResponse } from 'next/server';
import type { Product } from '@/data/products';
import { loadProducts, saveProducts } from '@/lib/products-storage';

export async function GET() {
  try {
    const products = loadProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const product: Product = await request.json();
    
    // Validate required fields
    if (!product.name || !product.category) {
      return NextResponse.json(
        { error: 'Le nom et la catégorie sont requis' },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    if (!product.id) {
      product.id = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Generate link if not provided
    if (!product.link) {
      product.link = `/products/${product.id}`;
    }

    const products = loadProducts();
    products.push(product);
    saveProducts(products);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du produit' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const product: Product = await request.json();
    
    if (!product.id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    const products = loadProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    products[index] = product;
    saveProducts(products);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    const products = loadProducts();
    const filtered = products.filter(p => p.id !== id);
    
    if (filtered.length === products.length) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    saveProducts(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}

