import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import type { Product } from '@/data/products';
import {
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/products-storage';
import { moveImageToCategory } from '@/lib/spaces';
import { requireAdminSession } from '@/lib/admin-auth';

async function ensureProductImagesInCategory(product: Product): Promise<Product> {
  const category: string = product.category ?? '';
  if (!category) return product;
  const out = { ...product };

  const urlsToProcess: string[] = [
    product.image ?? null,
    ...(product.images ?? []),
  ].filter((u): u is string => !!u && typeof u === 'string');

  if (urlsToProcess.length === 0) return product;

  const updatedUrls = await Promise.all(
    urlsToProcess.map((url) => moveImageToCategory(url, category))
  );

  let i = 0;
  if (out.image && typeof out.image === 'string') {
    out.image = updatedUrls[i++];
  }
  if (out.images?.length) {
    out.images = out.images.map((url) =>
      typeof url === 'string' ? updatedUrls[i++] : url
    );
  }
  return out;
}

export async function GET(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
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

export async function POST(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    let product: Product = await request.json();

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

    product = await ensureProductImagesInCategory(product);
    const createdProduct = await createProduct(product);

    // Revalidate cache for product pages
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/collections');
    revalidatePath('/promo');
    revalidatePath(`/products/${createdProduct.id}`);
    // Revalidate category page if category exists
    if (createdProduct.category) {
      revalidatePath(`/collections/${createdProduct.category}`);
    }

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du produit' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    let product: Product = await request.json();

    if (!product.id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    product = await ensureProductImagesInCategory(product);
    const updatedProduct = await updateProduct(product);

    // Revalidate cache for product pages
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/collections');
    revalidatePath('/promo');
    revalidatePath(`/products/${updatedProduct.id}`);
    // Revalidate category page if category exists
    if (updatedProduct.category) {
      revalidatePath(`/collections/${updatedProduct.category}`);
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    // Check if product not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du produit' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du produit requis' },
        { status: 400 }
      );
    }

    // Get product before deletion to know its category
    const { getProduct } = await import('@/lib/products-storage');
    const productToDelete = await getProduct(id);
    const category = productToDelete?.category;

    await deleteProduct(id);

    // Revalidate cache for product pages
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/collections');
    revalidatePath('/promo');
    revalidatePath(`/products/${id}`);
    // Revalidate category page if category exists
    if (category) {
      revalidatePath(`/collections/${category}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    
    // Check if product not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}
