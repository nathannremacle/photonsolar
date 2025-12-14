import { prisma } from './prisma';
import type { Product } from '@/data/products';
import type { Product as PrismaProduct } from '@prisma/client';

// ==============================================
// Type conversion helpers
// ==============================================

/**
 * Convert Prisma Product to frontend Product type
 */
function prismaToProduct(p: PrismaProduct): Product {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory || undefined,
    price: p.price || undefined,
    originalPrice: p.originalPrice || undefined,
    sku: p.sku || undefined,
    description: p.description || undefined,
    technicalDescription: p.technicalDescription || undefined,
    image: p.image || undefined,
    images: p.images || undefined,
    link: p.link,
    weight: p.weight || undefined,
    dimensions: p.dimensions || undefined,
    warranty: p.warranty || undefined,
    power: p.power || undefined,
    type: p.type || undefined,
    voltage: p.voltage || undefined,
    features: p.features || undefined,
    specifications: (p.specifications as Record<string, string>) || undefined,
    documentation: (p.documentation as {
      installationManual?: string;
      technicalSheet?: string;
      userGuide?: string;
    }) || undefined,
    mpptCount: p.mpptCount || undefined,
    apparentPower: p.apparentPower || undefined,
    nominalPower: p.nominalPower || undefined,
    hasEthernet: p.hasEthernet || undefined,
    hasWiFi: p.hasWiFi || undefined,
    networkConnection: p.networkConnection || undefined,
    cellType: p.cellType || undefined,
    efficiency: p.efficiency || undefined,
    maxPower: p.maxPower || undefined,
    capacity: p.capacity || undefined,
    batteryType: p.batteryType || undefined,
    cop: p.cop || undefined,
    heatingPower: p.heatingPower || undefined,
    color: p.color || undefined,
    material: p.material || undefined,
  };
}

/**
 * Convert frontend Product to Prisma create/update data
 */
function productToPrismaData(product: Product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    subcategory: product.subcategory || null,
    price: product.price || null,
    originalPrice: product.originalPrice || null,
    sku: product.sku || null,
    description: product.description || null,
    technicalDescription: product.technicalDescription || null,
    image: product.image || (product.images && product.images[0]) || null,
    images: product.images || [],
    link: product.link || `/products/${product.id}`,
    weight: product.weight || null,
    dimensions: product.dimensions || null,
    warranty: product.warranty || null,
    power: product.power || null,
    type: product.type || null,
    voltage: product.voltage || null,
    features: product.features || [],
    specifications: product.specifications || null,
    documentation: product.documentation || null,
    mpptCount: product.mpptCount || null,
    apparentPower: product.apparentPower || null,
    nominalPower: product.nominalPower || null,
    hasEthernet: product.hasEthernet || null,
    hasWiFi: product.hasWiFi || null,
    networkConnection: product.networkConnection || null,
    cellType: product.cellType || null,
    efficiency: product.efficiency || null,
    maxPower: product.maxPower || null,
    capacity: product.capacity || null,
    batteryType: product.batteryType || null,
    cop: product.cop || null,
    heatingPower: product.heatingPower || null,
    color: product.color || null,
    material: product.material || null,
  };
}

// ==============================================
// CRUD Operations
// ==============================================

/**
 * Load all products from database
 */
export async function loadProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { category: 'asc' },
        { brand: 'asc' },
        { name: 'asc' },
      ],
    });
    return products.map(prismaToProduct);
  } catch (error) {
    console.error('Error loading products from database:', error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product ? prismaToProduct(product) : null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
    return products.map(prismaToProduct);
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
}

/**
 * Get products by IDs (for best sellers, clearance, etc.)
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });
    
    // Maintain the order of the input IDs
    const productMap = new Map(products.map(p => [p.id, p]));
    return ids
      .map(id => productMap.get(id))
      .filter((p): p is PrismaProduct => p !== undefined)
      .map(prismaToProduct);
  } catch (error) {
    console.error('Error getting products by IDs:', error);
    return [];
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const searchTerm = query.toLowerCase();
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { brand: { contains: searchTerm, mode: 'insensitive' } },
          { category: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
    return products.map(prismaToProduct);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Create a new product
 */
export async function createProduct(product: Product): Promise<Product> {
  try {
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
    
    const created = await prisma.product.create({
      data: productToPrismaData(product),
    });
    
    return prismaToProduct(created);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(product: Product): Promise<Product> {
  try {
    if (!product.id) {
      throw new Error('Product ID is required for update');
    }
    
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: productToPrismaData(product),
    });
    
    return prismaToProduct(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    await prisma.product.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Save all products (bulk replace) - for backward compatibility
 * @deprecated Use createProduct, updateProduct, deleteProduct instead
 */
export async function saveProducts(products: Product[]): Promise<void> {
  try {
    // Use a transaction for atomic operation
    await prisma.$transaction(async (tx) => {
      // Get existing product IDs
      const existingProducts = await tx.product.findMany({
        select: { id: true },
      });
      const existingIds = new Set(existingProducts.map(p => p.id));
      
      // Determine which products to create, update, or delete
      const newProductIds = new Set(products.map(p => p.id));
      const toDelete = [...existingIds].filter(id => !newProductIds.has(id));
      
      // Delete removed products
      if (toDelete.length > 0) {
        await tx.product.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
      
      // Upsert all products
      for (const product of products) {
        await tx.product.upsert({
          where: { id: product.id },
          update: productToPrismaData(product),
          create: productToPrismaData(product),
        });
      }
    });
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
}

/**
 * Get product count
 */
export async function getProductCount(): Promise<number> {
  try {
    return await prisma.product.count();
  } catch (error) {
    console.error('Error counting products:', error);
    return 0;
  }
}

/**
 * Get products with pagination
 */
export async function getProductsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    category?: string;
    brand?: string;
    search?: string;
  }
): Promise<{ products: Product[]; total: number; pages: number }> {
  try {
    const where: any = {};
    
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.brand) {
      where.brand = filters.brand;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    
    return {
      products: products.map(prismaToProduct),
      total,
      pages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Error getting paginated products:', error);
    return { products: [], total: 0, pages: 0 };
  }
}
