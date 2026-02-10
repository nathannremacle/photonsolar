"use client";

import { useState, useEffect } from 'react';
import { useToastContext } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X,
  Save,
  Image as ImageIcon,
  Filter,
  RotateCcw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { checkAdminSession } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmModal from '@/components/admin/ConfirmModal';
import type { Product } from '@/data/products';
import ImageGallerySelector from '@/components/ImageGallerySelector';

export default function AdminProducts() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [productSortKey, setProductSortKey] = useState<'name' | 'brand' | 'category' | 'price'>('name');
  const [productSortDir, setProductSortDir] = useState<'asc' | 'desc'>('asc');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const toast = useToastContext();

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
    loadProducts();
  }, [router]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = (id: string) => setConfirmDeleteId(id);

  const handleDeleteConfirm = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      setConfirmDeleteId(null);
      if (response.ok) {
        loadProducts();
        toast.success('Produit supprimé');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression');
      setConfirmDeleteId(null);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      category: '',
      brand: '',
      link: '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const url = '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProduct(null);
        setFormData({});
        loadProducts();
        toast.success(editingProduct ? 'Produit mis à jour' : 'Produit créé');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => {
      if (field === 'documentation') {
        return { ...prev, documentation: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const updateSpecification = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    const key = prompt('Nom de la spécification:');
    if (key) {
      updateSpecification(key, '');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const specs = { ...(prev.specifications || {}) };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  };

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort() as string[];
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort() as string[];

  const filteredProducts = products.filter(p => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterBrand && p.brand !== filterBrand) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchName = p.name?.toLowerCase().includes(term);
      const matchBrand = p.brand?.toLowerCase().includes(term);
      const matchCategory = p.category?.toLowerCase().includes(term);
      const matchSku = p.sku?.toLowerCase().includes(term);
      if (!matchName && !matchBrand && !matchCategory && !matchSku) return false;
    }
    return true;
  });

  const hasActiveFilters = searchTerm.trim() !== '' || filterCategory !== '' || filterBrand !== '';
  const resetFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterBrand('');
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let cmp = 0;
    if (productSortKey === 'name') cmp = (a.name || '').localeCompare(b.name || '');
    else if (productSortKey === 'brand') cmp = (a.brand || '').localeCompare(b.brand || '');
    else if (productSortKey === 'category') cmp = (a.category || '').localeCompare(b.category || '');
    else if (productSortKey === 'price') cmp = (a.price ?? 0) - (b.price ?? 0);
    return productSortDir === 'asc' ? cmp : -cmp;
  });

  const toggleProductSort = (key: 'name' | 'brand' | 'category' | 'price') => {
    if (productSortKey === key) setProductSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setProductSortKey(key); setProductSortDir('asc'); }
  };

  if (!authenticated) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout title="Produits" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Produits"
      description={`${products.length} produit${products.length > 1 ? 's' : ''} au catalogue`}
    >
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, marque, catégorie ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Ajouter un produit</span>
            <span className="sm:hidden">Ajouter</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4 text-gray-500" />
            Filtres
          </span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            title="Catégorie"
          >
            <option value="">Toutes les catégories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            title="Marque"
          >
            <option value="">Toutes les marques</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          {hasActiveFilters && (
            <>
              <span className="text-sm text-gray-500">
                {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        {/* Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button type="button" onClick={() => toggleProductSort('name')} className="flex items-center gap-1 hover:text-gray-700">
                      Nom {productSortKey === 'name' && (productSortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button type="button" onClick={() => toggleProductSort('brand')} className="flex items-center gap-1 hover:text-gray-700">
                      Marque {productSortKey === 'brand' && (productSortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button type="button" onClick={() => toggleProductSort('category')} className="flex items-center gap-1 hover:text-gray-700">
                      Catégorie {productSortKey === 'category' && (productSortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button type="button" onClick={() => toggleProductSort('price')} className="flex items-center gap-1 hover:text-gray-700">
                      Prix {productSortKey === 'price' && (productSortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image || product.images?.[0] ? (
                        <div className="w-16 h-16 relative rounded overflow-hidden bg-gray-100">
                          <img
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200"><svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.sku && (
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price ? `${product.price.toFixed(2)} €` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(product.id!)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10 shadow-sm">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormData({});
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => updateFormField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marque *
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => updateFormField('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => updateFormField('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    <option value="onduleurs">Onduleurs</option>
                    <option value="panneaux-solaires">Panneaux Solaires</option>
                    <option value="batteries-stockage">Batteries</option>
                    <option value="borne-recharge">Bornes de Recharge</option>
                    <option value="pompe-chaleur">Pompes à Chaleur</option>
                    <option value="climatiseur">Climatiseurs</option>
                    <option value="poeles-cheminee">Poêles & Cheminées</option>
                    <option value="structure-montage">Structures de Montage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={(e) => updateFormField('subcategory', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        updateFormField('price', null);
                      } else {
                        const numValue = parseFloat(value);
                        updateFormField('price', isNaN(numValue) ? null : numValue);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix original (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        updateFormField('originalPrice', null);
                      } else {
                        const numValue = parseFloat(value);
                        updateFormField('originalPrice', isNaN(numValue) ? null : numValue);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => updateFormField('sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="outOfStock"
                    checked={!!formData.outOfStock}
                    onChange={(e) => updateFormField('outOfStock', e.target.checked)}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="outOfStock" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Rupture de stock (produit affiché mais non ajoutable au panier)
                  </label>
                </div>
              </div>

              {/* Images */}
              <ImageGallerySelector
                images={formData.images && formData.images.length > 0 
                  ? formData.images 
                  : formData.image 
                    ? [formData.image] 
                    : []}
                productId={formData.id || formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                category={formData.category}
                onChange={(newImages) => {
                  updateFormField('images', newImages);
                  if (newImages.length > 0) {
                    updateFormField('image', newImages[0]);
                  } else {
                    updateFormField('image', '');
                  }
                }}
                onUpload={async (files) => {
                  const uploadFormData = new FormData();
                  files.forEach(file => {
                    uploadFormData.append('images', file);
                  });
                  
                  // Add product ID and category for proper naming
                  const productId = formData.id || formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  if (productId) {
                    uploadFormData.append('productId', productId);
                  }
                  if (formData.category) {
                    uploadFormData.append('category', formData.category);
                  }

                  const response = await fetch('/api/admin/images/upload', {
                    method: 'POST',
                    body: uploadFormData,
                  });

                  const data = await response.json();

                  if (response.ok && data.success) {
                    if (data.warnings && data.warnings.length > 0) {
                      console.warn('Upload warnings:', data.warnings);
                    }
                    return data.files || [];
                  } else {
                    const errorMessage = data.error || 'Erreur lors de l\'upload';
                    const errorDetails = data.details 
                      ? (Array.isArray(data.details) ? data.details.join('\n') : data.details)
                      : '';
                    const fullMessage = errorDetails ? `${errorMessage}\n\nDétails:\n${errorDetails}` : errorMessage;
                    throw new Error(fullMessage);
                  }
                }}
              />

              {/* Descriptions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateFormField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description technique
                </label>
                <textarea
                  value={formData.technicalDescription || ''}
                  onChange={(e) => updateFormField('technicalDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Specifications */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Spécifications techniques
                  </label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateSpecification(key, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caractéristiques (une par ligne)
                </label>
                <textarea
                  value={formData.features?.join('\n') || ''}
                  onChange={(e) => updateFormField('features', e.target.value.split('\n').filter(Boolean))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Caractéristique 1&#10;Caractéristique 2"
                />
              </div>

              {/* Documentation */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Documentation technique
                </label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Manuel d'installation (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.documentation?.installationManual || ''}
                      onChange={(e) => updateFormField('documentation', {
                        ...formData.documentation,
                        installationManual: e.target.value
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/manual.pdf"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Fiche technique (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.documentation?.technicalSheet || ''}
                      onChange={(e) => updateFormField('documentation', {
                        ...formData.documentation,
                        technicalSheet: e.target.value
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/technical-sheet.pdf"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Guide d'utilisation (URL)
                    </label>
                    <input
                      type="url"
                      value={formData.documentation?.userGuide || ''}
                      onChange={(e) => updateFormField('documentation', {
                        ...formData.documentation,
                        userGuide: e.target.value
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/user-guide.pdf"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex items-center justify-end gap-4 z-10 shadow-sm">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setFormData({});
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors shadow-md"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Supprimer le produit"
        message="Voulez-vous vraiment supprimer ce produit ?"
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </AdminLayout>
  );
}

