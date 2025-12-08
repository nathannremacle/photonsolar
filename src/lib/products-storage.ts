import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { Product } from '@/data/products';

const PRODUCTS_TS_FILE = join(process.cwd(), 'src/data/products.ts');
const PRODUCTS_JSON_FILE = join(process.cwd(), 'data/products.json');

// Try to use JSON file first, fallback to TS file
export function loadProducts(): Product[] {
  // Try JSON file first (easier to manage)
  if (existsSync(PRODUCTS_JSON_FILE)) {
    try {
      const content = readFileSync(PRODUCTS_JSON_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading JSON file:', error);
    }
  }

  // Fallback: Import from TS file
  // In a Next.js API route, we can use dynamic import
  try {
    // This will work in Node.js environment (API routes)
    const productsModule = require('@/data/products');
    return productsModule.products || [];
  } catch (error) {
    console.error('Error loading products from TS file:', error);
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  // Save to JSON file (easier to manage)
  try {
    // Ensure directory exists
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(PRODUCTS_JSON_FILE);
    if (!existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(PRODUCTS_JSON_FILE, JSON.stringify(products, null, 2), 'utf-8');
    
    // Also update the TS file for compatibility
    updateTSFile(products);
  } catch (error) {
    console.error('Error saving products:', error);
    throw error;
  }
}

function updateTSFile(products: Product[]): void {
  try {
    const fileContent = readFileSync(PRODUCTS_TS_FILE, 'utf-8');
    
    // Create the products array string
    const productsString = formatProductsArray(products);
    
    // Replace the products array in the file
    const newContent = fileContent.replace(
      /export const products: Product\[\] = \[[\s\S]*?\];/,
      `export const products: Product[] = ${productsString};`
    );
    
    writeFileSync(PRODUCTS_TS_FILE, newContent, 'utf-8');
  } catch (error) {
    console.error('Error updating TS file:', error);
    // Don't throw - JSON file is the source of truth
  }
}

function formatProductsArray(products: Product[]): string {
  // Format products as a TypeScript array
  const formatted = products.map(product => {
    const lines: string[] = ['    {'];
    
    // Format each field
    if (product.id) lines.push(`      id: "${product.id}",`);
    if (product.name) lines.push(`      name: "${escapeString(product.name)}",`);
    if (product.brand) lines.push(`      brand: "${escapeString(product.brand)}",`);
    if (product.category) lines.push(`      category: "${product.category}",`);
    if (product.subcategory) lines.push(`      subcategory: "${product.subcategory}",`);
    if (product.price !== undefined) lines.push(`      price: ${product.price},`);
    if (product.originalPrice !== undefined) lines.push(`      originalPrice: ${product.originalPrice},`);
    if (product.power) lines.push(`      power: "${escapeString(product.power)}",`);
    if (product.type) lines.push(`      type: "${escapeString(product.type)}",`);
    if (product.voltage) lines.push(`      voltage: "${escapeString(product.voltage)}",`);
    if (product.warranty) lines.push(`      warranty: "${escapeString(product.warranty)}",`);
    if (product.weight) lines.push(`      weight: "${escapeString(product.weight)}",`);
    if (product.dimensions) lines.push(`      dimensions: "${escapeString(product.dimensions)}",`);
    if (product.sku) lines.push(`      sku: "${escapeString(product.sku)}",`);
    if (product.description) lines.push(`      description: "${escapeString(product.description)}",`);
    if (product.technicalDescription) lines.push(`      technicalDescription: "${escapeString(product.technicalDescription)}",`);
    
    // Images
    if (product.images && product.images.length > 0) {
      lines.push(`      image: "${product.images[0]}",`);
      lines.push(`      images: [`);
      product.images.forEach(img => {
        lines.push(`        "${img}",`);
      });
      lines.push(`      ],`);
    } else if (product.image) {
      lines.push(`      image: "${product.image}",`);
    }
    
    // Link
    if (product.link) lines.push(`      link: "${product.link}",`);
    
    // Features
    if (product.features && product.features.length > 0) {
      lines.push(`      features: [`);
      product.features.forEach(feature => {
        lines.push(`        "${escapeString(feature)}",`);
      });
      lines.push(`      ],`);
    }
    
    // Specifications
    if (product.specifications && Object.keys(product.specifications).length > 0) {
      lines.push(`      specifications: {`);
      Object.entries(product.specifications).forEach(([key, value]) => {
        lines.push(`        "${escapeString(key)}": "${escapeString(value)}",`);
      });
      lines.push(`      },`);
    }
    
    // Documentation
    if (product.documentation) {
      lines.push(`      documentation: {`);
      if (product.documentation.installationManual) {
        lines.push(`        installationManual: "${product.documentation.installationManual}",`);
      }
      if (product.documentation.technicalSheet) {
        lines.push(`        technicalSheet: "${product.documentation.technicalSheet}",`);
      }
      if (product.documentation.userGuide) {
        lines.push(`        userGuide: "${product.documentation.userGuide}",`);
      }
      lines.push(`      },`);
    }
    
    // Additional fields
    if (product.mpptCount !== undefined) lines.push(`      mpptCount: ${product.mpptCount},`);
    if (product.apparentPower) lines.push(`      apparentPower: "${escapeString(product.apparentPower)}",`);
    if (product.nominalPower) lines.push(`      nominalPower: "${escapeString(product.nominalPower)}",`);
    if (product.hasEthernet !== undefined) lines.push(`      hasEthernet: ${product.hasEthernet},`);
    if (product.hasWiFi !== undefined) lines.push(`      hasWiFi: ${product.hasWiFi},`);
    if (product.networkConnection) lines.push(`      networkConnection: "${escapeString(product.networkConnection)}",`);
    if (product.cellType) lines.push(`      cellType: "${escapeString(product.cellType)}",`);
    if (product.efficiency) lines.push(`      efficiency: "${escapeString(product.efficiency)}",`);
    if (product.maxPower) lines.push(`      maxPower: "${escapeString(product.maxPower)}",`);
    if (product.capacity) lines.push(`      capacity: "${escapeString(product.capacity)}",`);
    if (product.batteryType) lines.push(`      batteryType: "${escapeString(product.batteryType)}",`);
    if (product.cop) lines.push(`      cop: "${escapeString(product.cop)}",`);
    if (product.heatingPower) lines.push(`      heatingPower: "${escapeString(product.heatingPower)}",`);
    if (product.color) lines.push(`      color: "${escapeString(product.color)}",`);
    if (product.material) lines.push(`      material: "${escapeString(product.material)}",`);
    
    lines.push('    },');
    return lines.join('\n');
  }).join('\n');
  
  return `[\n${formatted}\n  ]`;
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

