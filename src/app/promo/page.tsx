"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products, type Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tag } from "lucide-react";

export default function PromoPage() {
  const { language } = useLanguage();
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Filtrer les produits en promotion (ceux avec originalPrice > price)
    const filtered = products.filter(
      (p) => p.originalPrice && p.price && p.originalPrice > p.price
    );
    setPromoProducts(filtered);
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-8 h-8 text-primary-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                {language === "fr" ? "Promotions" : "Promotions"}
              </h1>
            </div>
            <p className="text-gray-600">
              {promoProducts.length}{" "}
              {language === "fr"
                ? "produit(s) en promotion"
                : "product(s) on promotion"}
            </p>
          </div>

          {promoProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600 text-lg">
                {language === "fr"
                  ? "Aucun produit en promotion pour le moment"
                  : "No products on promotion at the moment"}
              </p>
            </div>
          ) : (
            <ProductGrid products={promoProducts} />
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

