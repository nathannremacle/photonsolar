"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, GripVertical } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ImageGallerySelectorProps {
  images?: string[];
  onChange: (images: string[]) => void;
  onUpload?: (files: File[]) => Promise<string[]>;
  productId?: string;
  category?: string;
}

export default function ImageGallerySelector({ 
  images = [], 
  onChange, 
  onUpload,
  productId,
  category
}: ImageGallerySelectorProps) {
  const [availableImages, setAvailableImages] = useState<Array<{ url: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAvailableImages();
  }, [category]);

  const loadAvailableImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      const data = await response.json();
      
      // Filter only product images
      type ProductImage = {
        url: string;
        name: string;
        path: string;
        category: string;
      };
      
      let productImages: ProductImage[] = (data.images || []).filter((img: any) => {
        return img.path && img.path.includes('products/');
      }).map((img: any) => {
        // Extract category from path: products/category/filename
        const pathParts = img.path.split('/');
        const categoryIndex = pathParts.indexOf('products');
        const categoryName = categoryIndex >= 0 && pathParts[categoryIndex + 1] ? pathParts[categoryIndex + 1] : '';
        
        return {
          url: img.url,
          name: img.name,
          path: img.path,
          category: categoryName,
        };
      });
      
      // Sort: images from current category first, then others
      if (category) {
        productImages.sort((a: ProductImage, b: ProductImage) => {
          const aInCategory = a.category === category;
          const bInCategory = b.category === category;
          if (aInCategory && !bInCategory) return -1;
          if (!aInCategory && bInCategory) return 1;
          return 0;
        });
      }
      
      setAvailableImages(productImages);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !onUpload) return;

    setLoading(true);
    try {
      const fileArray = Array.from(files);
      const uploadedUrls = await onUpload(fileArray);
      const newImages = [...images, ...uploadedUrls];
      onChange(newImages);
      await loadAvailableImages();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'upload des images';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newImages = [...images];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, removed);
    onChange(newImages);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleAddFromGallery = (imageUrl: string) => {
    if (!images.includes(imageUrl)) {
      onChange([...images, imageUrl]);
    }
  };

  const handleDropZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Images du produit
      </label>

      {/* Selected Images Gallery */}
      <div className="space-y-3">
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group cursor-move ${
                  dragOverIndex === index ? 'ring-2 ring-primary-500' : ''
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={normalizeImageUrl(imageUrl)}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover relative z-0"
                    style={{ display: 'block', backgroundColor: 'transparent', position: 'relative', zIndex: 0 }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                      }
                    }}
                    onLoad={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'block';
                    }}
                  />
                  {/* Hover controls - positioned above the image without overlay */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-opacity z-20 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-gray-900/70 text-white text-xs px-2 py-1 rounded transition-opacity z-20">
                    <GripVertical className="w-3 h-3" />
                    <span>Glisser</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/70 to-transparent text-white text-xs py-2 px-2 text-center z-10">
                    Image {index + 1} {index === 0 && '(principale)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Zone */}
        <div
          ref={dropZoneRef}
          onDrop={handleDropZoneDrop}
          onDragOver={handleDropZoneDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Glissez-déposez des images ici ou cliquez pour sélectionner
          </p>
          <p className="text-xs text-gray-500">
            Formats acceptés: JPG, PNG, GIF, WebP (max 10MB par image)
          </p>
          {loading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}
        </div>
      </div>

      {/* Available Images Gallery */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Images disponibles (cliquez pour ajouter)
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
          {availableImages.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Aucune image disponible</p>
            </div>
          ) : (
            availableImages.map((img, index) => (
              <div
                key={index}
                onClick={() => handleAddFromGallery(img.url)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  images.includes(img.url)
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <img
                  src={normalizeImageUrl(img.url)}
                  alt={img.name}
                  className="w-full h-full object-cover"
                  style={{ display: 'block', backgroundColor: 'transparent' }}
                  onError={(e) => {
                    console.error('Image failed to load:', img.url);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                    }
                  }}
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'block';
                  }}
                />
                {images.includes(img.url) && (
                  <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-1 shadow-lg">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

