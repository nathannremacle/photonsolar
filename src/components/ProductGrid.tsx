"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/data/products";
import { ShoppingCart } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { t, language } = useLanguage();
  const { addItem, openCart } = useCart();
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + itemsPerPage);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">
          {language === "fr" ? "Aucun produit trouvé" : "No products found"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group"
          >
            <Link href={product.link} className="block">
              <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {(() => {
                    const productImage = product.images?.[0] || product.image;
                    if (productImage && productImage !== "/placeholder-product.jpg") {
                      return (
                        <Image
                          src={productImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          onError={(e) => {
                            // Si l'image ne charge pas, afficher le placeholder
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent && !parent.querySelector('.placeholder-fallback')) {
                              const placeholder = document.createElement('div');
                              placeholder.className = 'absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center placeholder-fallback';
                              placeholder.innerHTML = `<span class="text-gray-400 text-sm">${language === "fr" ? "Image produit" : "Product image"}</span>`;
                              parent.appendChild(placeholder);
                            }
                          }}
                        />
                      );
                    }
                    return (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          {language === "fr" ? "Image produit" : "Product image"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-semibold">{product.brand}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[40px]">
                    {product.name}
                  </h3>
                  <div className="space-y-1 mb-4 text-xs text-gray-600">
                    {product.power && (
                      <p><strong>{language === "fr" ? "Puissance" : "Power"}:</strong> {product.power}</p>
                    )}
                    {product.type && (
                      <p><strong>{language === "fr" ? "Type" : "Type"}:</strong> {product.type}</p>
                    )}
                    {product.voltage && (
                      <p><strong>{language === "fr" ? "Voltage" : "Voltage"}:</strong> {product.voltage}</p>
                    )}
                    {product.warranty && (
                      <p><strong>{language === "fr" ? "Garantie" : "Warranty"}:</strong> {product.warranty}</p>
                    )}
                  </div>
                  {/* Price */}
                  <div className="mb-3">
                    {product.price ? (
                      <div className="flex items-baseline gap-2">
                        {product.originalPrice && product.originalPrice > product.price && (
                          <>
                            <span className="text-lg font-bold text-gray-900">
                              € {product.price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              € {product.originalPrice.toFixed(2)}
                            </span>
                            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </span>
                          </>
                        )}
                        {(!product.originalPrice || product.originalPrice <= product.price) && (
                          <span className="text-xl font-bold text-gray-900">
                            € {product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        {language === "fr" ? "Prix sur demande" : "Price on request"}
                      </div>
                    )}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addItem(product, 1);
                      openCart();
                    }}
                    className={`
                      w-full py-2.5 px-4 rounded-lg font-semibold 
                      flex items-center justify-center gap-2
                      transition-all duration-300 ease-out
                      transform hover:scale-[1.02] active:scale-[0.98]
                      ${product.price 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                    disabled={!product.price}
                  >
                    <ShoppingCart size={18} className={product.price ? 'group-hover:animate-bounce' : ''} />
                    <span>{language === "fr" ? "Ajouter au panier" : "Add to cart"}</span>
                  </button>
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {language === "fr" ? "Affichage de" : "Showing"} {startIndex + 1}–{Math.min(startIndex + itemsPerPage, products.length)} {language === "fr" ? "sur" : "of"} {products.length} {language === "fr" ? "résultats" : "results"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={12}>12 {language === "fr" ? "Articles" : "Items"}</option>
              <option value={24}>24 {language === "fr" ? "Articles" : "Items"}</option>
              <option value={36}>36 {language === "fr" ? "Articles" : "Items"}</option>
              <option value={48}>48 {language === "fr" ? "Articles" : "Items"}</option>
            </select>
          </div>
        </div>
      )}

      {/* Page Numbers */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === index + 1
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

