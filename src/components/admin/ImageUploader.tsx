"use client";

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  onUpload?: (file: File) => Promise<string>;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Image",
  onUpload,
  className = "",
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (onUpload) {
        const url = await onUpload(file);
        onChange(url);
      } else {
        // Default upload behavior
        const formData = new FormData();
        formData.append('images', file);

        const response = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.success && data.files.length > 0) {
          onChange(data.files[0]);
          if (data.warnings && data.warnings.length > 0) {
            console.warn('Upload warnings:', data.warnings);
          }
        } else {
          const errorMessage = data.error || 'Erreur lors de l\'upload';
          const errorDetails = data.details 
            ? (Array.isArray(data.details) ? data.details.join('\n') : data.details)
            : '';
          throw new Error(errorDetails ? `${errorMessage}\n\n${errorDetails}` : errorMessage);
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'upload de l\'image';
      alert(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Image Preview */}
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 sm:h-64 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
            <img
              src={normalizeImageUrl(value)}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <button
                onClick={removeImage}
                className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all transform hover:scale-110"
                title="Supprimer l'image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Cliquez sur la zone ci-dessous pour changer l'image
          </p>
        </div>
      ) : (
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative w-full h-48 sm:h-64 border-2 border-dashed rounded-xl
            flex flex-col items-center justify-center
            cursor-pointer transition-all
            ${isDragging
              ? 'border-orange-500 bg-orange-50 scale-105'
              : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <>
              <div className={`
                p-4 rounded-full mb-3 transition-colors
                ${isDragging ? 'bg-orange-100' : 'bg-gray-100'}
              `}>
                {isDragging ? (
                  <Upload className="w-8 h-8 text-orange-600" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging ? 'Déposez l\'image ici' : 'Glissez-déposez une image'}
              </p>
              <p className="text-xs text-gray-500 text-center px-4">
                ou cliquez pour sélectionner
              </p>
              <p className="text-xs text-gray-400 mt-2">
                JPG, PNG, GIF, WebP (max 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Upload Button (when image exists) */}
      {value && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-3 w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-orange-400 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Upload en cours...' : 'Changer l\'image'}
        </button>
      )}
    </div>
  );
}

