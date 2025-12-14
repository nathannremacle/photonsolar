"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProductById } from "@/data/products";
import { safeFetchJson } from "@/utils/api";

export default function BestSellers() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;
  const { t, language } = useLanguage();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await safeFetchJson<{ content: any }>("/api/homepage");
      if (error) {
        console.error("Error loading best sellers:", error);
        return;
      }
      if (data?.content) {
        setProductIds(data.content.bestSellers?.productIds || []);
        setEnabled(data.content.bestSellers?.enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading best sellers:", error);
    }
  };

  const products = productIds.map(id => getProductById(id)).filter(Boolean) as any[];

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= products.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - itemsPerView < 0 
        ? Math.max(0, products.length - itemsPerView) 
        : prev - itemsPerView
    );
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerView);

  if (!enabled || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {language === "fr" ? "Meilleures ventes" : "Best Sellers"}
        </h2>
        
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <article className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={product.link} className="block">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {(() => {
                        const productImage = product.images?.[0] || product.image;
                        if (productImage && productImage !== "/placeholder-product.jpg") {
                          return (
                            <>
                              <Image
                                src={productImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              {product.badge && (
                                <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                  {product.badge}
                                </span>
                              )}
                            </>
                          );
                        }
                        return (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Image produit</span>
                            </div>
                            {product.badge && (
                              <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                {product.badge}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-semibold">{product.brand}</span>
                        {product.sku && (
                          <span className="text-xs text-gray-400">{product.sku}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    {/* Price */}
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
                </article>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Faire glisser vers la gauche"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= products.length}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Faire glisser vers la droite"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * itemsPerView)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(currentIndex / itemsPerView) === index
                  ? 'bg-gray-900 w-8' 
                  : 'bg-gray-300'
              }`}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

