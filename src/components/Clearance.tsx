"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { getProductById } from "@/data/products";

// Utiliser les produits en déstockage depuis la base de données
// Pour l'instant, on utilise quelques produits existants comme exemples
const clearanceProductIds = [
  "deye-sun-3kw",
  "deye-sun-5kw",
  "growatt-min-3000tl",
  "elitec-xmax-460",
];

export default function Clearance() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 4;
  const { t, language } = useLanguage();

  // Récupérer les produits depuis la base de données
  const clearanceProducts = clearanceProductIds
    .map(id => getProductById(id))
    .filter(Boolean) as any[];

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView >= clearanceProducts.length ? 0 : prev + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev - itemsPerView < 0 
        ? Math.max(0, clearanceProducts.length - itemsPerView) 
        : prev - itemsPerView
    );
  };

  const visibleProducts = clearanceProducts.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {language === "fr" ? "Déstockage" : "Clearance"}
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
                              <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                {language === "fr" ? "Déstockage" : "Clearance"}
                              </span>
                            </>
                          );
                        }
                        return (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Image produit</span>
                            </div>
                            <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                              {language === "fr" ? "Déstockage" : "Clearance"}
                            </span>
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
            disabled={currentIndex + itemsPerView >= clearanceProducts.length}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Faire glisser vers la droite"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/collections/destockage"
            className="inline-block text-orange-600 font-semibold hover:text-orange-700 transition-colors"
          >
            {t("common.seeAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}

