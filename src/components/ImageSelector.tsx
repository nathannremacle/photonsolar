"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Search } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageSelector({
  value,
  onChange,
  label = "Image",
  placeholder = "Sélectionner une image",
}: ImageSelectorProps) {
  const [availableImages, setAvailableImages] = useState<Array<{ url: string; name: string; path: string }>>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showGallery) {
      loadAvailableImages();
    }
  }, [showGallery]);

  const loadAvailableImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      const data = await response.json();
      
      const images = (data.images || []).map((img: any) => ({
        url: img.url,
        name: img.name,
        path: img.path,
      }));
      
      setAvailableImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok && data.success && data.files.length > 0) {
        onChange(data.files[0]);
        setShowGallery(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    }
  };

  const filteredImages = availableImages.filter(img =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Current Image Preview */}
      {value ? (
        <div className="relative mb-3">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
            <img
              src={normalizeImageUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <button
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-3">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucune image</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowGallery(!showGallery)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ImageIcon className="w-4 h-4" />
          {value ? "Changer l'image" : "Sélectionner une image"}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Uploader
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={false}
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Image Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Sélectionner une image</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une image..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Image Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredImages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune image trouvée</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredImages.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => {
                        onChange(img.url);
                        setShowGallery(false);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        value === img.url
                          ? 'border-orange-600 ring-2 ring-orange-200'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={normalizeImageUrl(img.url)}
                        alt={img.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {value === img.url && (
                        <div className="absolute inset-0 bg-orange-600 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-orange-600 text-white rounded-full p-2">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

