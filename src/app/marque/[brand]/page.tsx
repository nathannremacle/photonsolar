"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import type { Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

function MarqueContent() {
  const params = useParams();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const brandParam = params?.brand as string;
    if (!brandParam) return;
    const brandName = decodeURIComponent(brandParam);
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.products) {
          const filtered = data.products.filter(
            (p: Product) => p.brand && p.brand === brandName
          );
          setProducts(filtered);
        }
      } catch (e) {
        console.error("Error loading products by brand:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.brand]);

  const brandName = params?.brand ? decodeURIComponent(params.brand as string) : "";

  if (!brandName || loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-600">
              {language === "fr" ? "Chargement..." : "Loading..."}
            </p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {language === "fr" ? "Produits de la marque" : "Products by brand"}: {brandName}
          </h1>
          <p className="text-gray-600 mb-6">
            {products.length}{" "}
            {language === "fr" ? "produit(s) trouvé(s)" : "product(s) found"}
          </p>
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p className="text-gray-500">
              {language === "fr"
                ? "Aucun produit pour cette marque."
                : "No products for this brand."}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function MarquePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen">
          <Navbar />
          <div className="pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <MarqueContent />
    </Suspense>
  );
}
