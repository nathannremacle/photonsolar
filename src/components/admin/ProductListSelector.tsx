"use client";

import { useState } from 'react';
import { X, Search, GripVertical, Package, Plus } from 'lucide-react';
import { products, type Product } from '@/data/products';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ProductListSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  maxSelection?: number;
}

export default function ProductListSelector({
  selectedIds,
  onChange,
  label = "Sélectionner des produits",
  maxSelection,
}: ProductListSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleProduct = (productId: string) => {
    if (selectedIds.includes(productId)) {
      onChange(selectedIds.filter(id => id !== productId));
    } else {
      if (maxSelection && selectedIds.length >= maxSelection) {
        alert(`Vous ne pouvez sélectionner que ${maxSelection} produit(s) maximum`);
        return;
      }
      onChange([...selectedIds, productId]);
    }
  };

  const selectedProducts = products.filter(p => selectedIds.includes(p.id));

  // Maintain order based on selectedIds
  const orderedProducts = selectedIds
    .map(id => selectedProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

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

    const newIds = [...selectedIds];
    const [moved] = newIds.splice(draggedIndex, 1);
    newIds.splice(dropIndex, 0, moved);
    onChange(newIds);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          {selectedProducts.length > 0 ? "Modifier" : "Ajouter des produits"}
        </button>
      </div>

      {/* Selected Products List with Drag & Drop */}
      {orderedProducts.length > 0 ? (
        <div className="space-y-2">
          {orderedProducts.map((product, index) => {
            const productImage = product.images?.[0] || product.image || "/placeholder-product.jpg";
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            
            return (
              <div
                key={product.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center gap-3 p-3 bg-white rounded-lg border-2 transition-all
                  ${isDragging ? 'opacity-50 border-orange-400' : 'border-gray-200 hover:border-orange-300'}
                  ${isDragOver ? 'border-orange-500 bg-orange-50' : ''}
                `}
              >
                <GripVertical 
                  className="w-5 h-5 text-gray-400 flex-shrink-0 cursor-move"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                />
                <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={normalizeImageUrl(productImage)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500">{product.brand} • {product.category}</p>
                </div>
                <button
                  onClick={() => toggleProduct(product.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Retirer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Aucun produit sélectionné</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter des produits" pour commencer</p>
        </div>
      )}

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sélectionner des produits</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedIds.length} produit{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
                  {maxSelection && ` (max ${maxSelection})`}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200 space-y-4 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category === "all" ? "Tous" : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucun produit trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    const productImage = product.images?.[0] || product.image || "/placeholder-product.jpg";
                    
                    return (
                      <button
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-200 shadow-sm'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-orange-600 text-white rounded-full p-1.5 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className="relative w-full h-32 bg-gray-200 rounded-lg overflow-hidden mb-3">
                          <img
                            src={normalizeImageUrl(productImage)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{product.brand}</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded">
                            {product.category}
                          </span>
                        </div>
                        {product.price && (
                          <p className="text-sm font-bold text-orange-600 mt-2">
                            {product.price.toLocaleString('fr-FR')} €
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600 font-medium">
                {selectedIds.length} produit{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

