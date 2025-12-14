"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { getProductsByCategory, type Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

function CategoryContent() {
  const { t, language } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    const categoryParam = params?.category as string;
    const subcategory = searchParams.get("subcategory") || undefined;
    
    if (categoryParam) {
      setCategory(categoryParam);
      const products = getProductsByCategory(categoryParam, subcategory);
      setAllProducts(products);
      setFilteredProducts(products);
    }
  }, [params, searchParams]);

  const categoryNames: Record<string, { fr: string; en: string }> = {
    "onduleurs": { fr: "Onduleurs", en: "Inverters" },
    "panneaux-solaires": { fr: "Panneaux Solaires", en: "Solar Panels" },
    "batteries-stockage": { fr: "Batteries & Stockage", en: "Batteries & Storage" },
    "structure-montage": { fr: "Structure de Montage", en: "Mounting Structure" },
    "borne-recharge": { fr: "Borne de Recharge", en: "Charging Station" },
    "pompe-chaleur": { fr: "Pompe à Chaleur", en: "Heat Pump" },
    "batterie-plug-play": { fr: "Batterie Plug & Play", en: "Plug & Play Battery" },
    "poeles-cheminee": { fr: "Poélés & Cheminée", en: "Stoves & Fireplace" },
    "climatiseur": { fr: "Climatiseur", en: "Air Conditioner" },
  };

  const subcategoryNames: Record<string, { fr: string; en: string }> = {
    "hybride": { fr: "Hybride", en: "Hybrid" },
    "on-grid": { fr: "ON GRID", en: "ON GRID" },
    "micro-onduleur": { fr: "Micro Onduleur 800W à 2000W", en: "Micro Inverter 800W to 2000W" },
  };

  const subcategory = searchParams.get("subcategory") || undefined;
  const categoryName = category ? (categoryNames[category]?.[language] || category) : "";
  const subcategoryName = subcategory ? subcategoryNames[subcategory]?.[language] || subcategory : null;

  if (!category) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-600">Chargement...</p>
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
            {subcategoryName ? `${subcategoryName} - ${categoryName}` : categoryName}
          </h1>
          <p className="text-gray-600 mb-6">
            {filteredProducts.length} {language === "fr" ? "produit(s) trouvé(s)" : "product(s) found"}
          </p>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar avec filtres */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <ProductFilters 
                products={allProducts} 
                category={category}
                onFilterChange={setFilteredProducts}
              />
            </aside>
            
            {/* Contenu principal avec grille de produits */}
            <div className="flex-1">
              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <CategoryContent />
    </Suspense>
  );
}

