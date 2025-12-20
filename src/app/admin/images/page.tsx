"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Trash2, 
  Search, 
  Image as ImageIcon,
  X,
  Check
} from 'lucide-react';
import { checkAdminSession } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';

interface ImageFile {
  name: string;
  path: string;
  url: string;
  size?: number;
}

export default function AdminImages() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
    loadImages();
  }, [router]);

  const loadImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
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
      
      if (response.ok) {
        loadImages();
        setShowUploadModal(false);
        const successMessage = data.message || 'Images uploadées avec succès!';
        if (data.warnings && data.warnings.length > 0) {
          alert(`${successMessage}\n\nAvertissements:\n${data.warnings.join('\n')}`);
        } else {
          alert(successMessage);
        }
      } else {
        const errorMessage = data.error || 'Erreur lors de l\'upload';
        const errorDetails = data.details 
          ? (Array.isArray(data.details) ? data.details.join('\n') : data.details)
          : '';
        const fullMessage = errorDetails ? `${errorMessage}\n\nDétails:\n${errorDetails}` : errorMessage;
        alert(fullMessage);
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'upload';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/images?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadImages();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedImages.size} image(s) ?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedImages).map(path =>
        fetch(`/api/admin/images?path=${encodeURIComponent(path)}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      setSelectedImages(new Set());
      loadImages();
    } catch (error) {
      console.error('Error deleting images:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const toggleImageSelection = (path: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedImages(newSelected);
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copiée dans le presse-papier!');
  };

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authenticated) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Images" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Images"
      description={`${images.length} image${images.length > 1 ? 's' : ''} dans la bibliothèque`}
    >
            <div className="flex items-center gap-4">
              {selectedImages.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer ({selectedImages.size})
                </button>
              )}
            </div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une image..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedImages.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer ({selectedImages.size})
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Uploader des images</span>
            <span className="sm:hidden">Uploader</span>
          </button>
        </div>
      </div>

      <div>
        {/* Images Grid */}
        {filteredImages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune image trouvée</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Uploader votre première image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.path}
                className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer relative group ${
                  selectedImages.has(image.path) ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => toggleImageSelection(image.path)}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      selectedImages.has(image.path)
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {selectedImages.has(image.path) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Image */}
                <div className="aspect-square relative bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover relative z-0"
                    style={{ display: 'block', backgroundColor: 'transparent', position: 'relative', zIndex: 0 }}
                    onError={(e) => {
                      console.error('Image failed to load:', image.url);
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
                  {/* Hover controls - positioned without dark overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyImageUrl(image.url);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-opacity shadow-lg"
                    >
                      Copier URL
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.path);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate" title={image.path}>
                    {image.path}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Uploader des images</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Glissez-déposez vos images ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-primary-700 transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'Upload en cours...' : 'Sélectionner des images'}
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Formats acceptés: JPG, PNG, GIF, WebP (max 10MB par image)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

