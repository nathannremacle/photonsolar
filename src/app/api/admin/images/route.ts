import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, statSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const PUBLIC_IMAGES_DIR = join(process.cwd(), 'public/images');

interface ImageFile {
  name: string;
  path: string;
  url: string;
  size?: number;
}

function scanImages(dir: string, basePath: string = ''): ImageFile[] {
  const images: ImageFile[] = [];
  
  if (!existsSync(dir)) {
    return images;
  }

  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        images.push(...scanImages(fullPath, relativePath));
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
          const stats = statSync(fullPath);
          images.push({
            name: entry.name,
            path: relativePath,
            url: `/images/${relativePath}`,
            size: stats.size,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return images;
}

export async function GET() {
  try {
    const images = scanImages(PUBLIC_IMAGES_DIR);
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error loading images:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Chemin de l\'image requis' },
        { status: 400 }
      );
    }

    const fullPath = join(PUBLIC_IMAGES_DIR, imagePath);
    
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Image non trouvée' },
        { status: 404 }
      );
    }

    unlinkSync(fullPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'image' },
      { status: 500 }
    );
  }
}

