import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

const PUBLIC_IMAGES_DIR = join(process.cwd(), 'public/images');

/**
 * Find the next available image number for a product
 */
function findNextImageNumber(uploadDir: string, productId: string, ext: string): number {
  if (!existsSync(uploadDir)) {
    return 1; // First image (no number)
  }
  
  const sanitizedProductId = productId.replace(/[^a-zA-Z0-9-]/g, '-');
  const existingFiles = readdirSync(uploadDir);
  
  // Check if base file exists (no number)
  const baseFileExists = existingFiles.some((f: string) => {
    const lowerF = f.toLowerCase();
    return lowerF === `${sanitizedProductId}.${ext}` ||
           lowerF === `${sanitizedProductId}.jpg` ||
           lowerF === `${sanitizedProductId}.jpeg` ||
           lowerF === `${sanitizedProductId}.png` ||
           lowerF === `${sanitizedProductId}.gif` ||
           lowerF === `${sanitizedProductId}.webp`;
  });
  
  if (!baseFileExists) {
    return 1; // Base file doesn't exist, use base name
  }
  
  // Find all numbered files for this product
  const pattern = new RegExp(`^${sanitizedProductId}-(\\d+)\\.${ext}$`, 'i');
  const numbers: number[] = [];
  
  existingFiles.forEach((f: string) => {
    const match = f.match(pattern);
    if (match) {
      numbers.push(parseInt(match[1]));
    }
  });
  
  if (numbers.length === 0) {
    return 2; // Base exists, next is -2
  }
  
  return Math.max(...numbers) + 1;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const productId = formData.get('productId') as string | null;
    const category = formData.get('category') as string | null;

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      );
    }

    const uploadedFiles: string[] = [];
    
    // Determine subdirectory
    const subdir = category ? `products/${category}` : 'products';
    const uploadDir = join(PUBLIC_IMAGES_DIR, subdir);
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Pre-calculate starting number for product images (only once)
    let startingImageNumber = 1;
    let sanitizedProductId = '';
    let defaultExt = 'png';
    
    if (productId) {
      sanitizedProductId = productId.replace(/[^a-zA-Z0-9-]/g, '-');
      // Get extension from first file
      const firstFile = files.find(f => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        return validTypes.includes(f.type);
      });
      if (firstFile) {
        defaultExt = firstFile.name.split('.').pop()?.toLowerCase() || 'png';
      }
      startingImageNumber = findNextImageNumber(uploadDir, sanitizedProductId, defaultExt);
    }

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      // Generate filename
      let filename: string;
      
      if (productId) {
        const ext = file.name.split('.').pop()?.toLowerCase() || defaultExt;
        
        // Calculate image number for this file
        const imageNumber = startingImageNumber + index;
        
        // First image: no number if base doesn't exist, otherwise use calculated number
        if (imageNumber === 1 && index === 0) {
          // Check if base file exists
          const baseExists = existsSync(join(uploadDir, `${sanitizedProductId}.${ext}`));
          if (!baseExists) {
            filename = `${sanitizedProductId}.${ext}`;
          } else {
            filename = `${sanitizedProductId}-2.${ext}`;
          }
        } else {
          filename = `${sanitizedProductId}-${imageNumber}.${ext}`;
        }
      } else {
        // Fallback to timestamp naming
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        filename = `${timestamp}-${index}-${originalName}`;
      }

      // Check if file already exists and find next available name
      let finalFilename = filename;
      if (existsSync(join(uploadDir, finalFilename))) {
        if (productId) {
          const sanitizedProductId = productId.replace(/[^a-zA-Z0-9-]/g, '-');
          const ext = filename.split('.').pop();
          let counter = 2;
          while (existsSync(join(uploadDir, `${sanitizedProductId}-${counter}.${ext}`))) {
            counter++;
          }
          finalFilename = `${sanitizedProductId}-${counter}.${ext}`;
        } else {
          const ext = filename.split('.').pop();
          const base = filename.replace(`.${ext}`, '');
          let counter = 1;
          while (existsSync(join(uploadDir, `${base}-${counter}.${ext}`))) {
            counter++;
          }
          finalFilename = `${base}-${counter}.${ext}`;
        }
      }

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = join(uploadDir, finalFilename);
      
      await writeFile(filePath, buffer);
      uploadedFiles.push(`/images/${subdir}/${finalFilename}`);
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image valide n\'a pu être uploadée' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles,
      message: `${uploadedFiles.length} image(s) uploadée(s) avec succès`
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des images' },
      { status: 500 }
    );
  }
}
