"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { getProductById, type Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tag } from "lucide-react";
import { safeFetchJson } from "@/utils/api";

export default function DestockagePage() {
  const { t, language } = useLanguage();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClearanceProducts();
  }, []);

  const loadClearanceProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await safeFetchJson<{ content: any }>("/api/homepage");
      
      if (error) {
        console.error("Error loading clearance products:", error);
        return;
      }
      
      if (data?.content?.clearance?.productIds) {
        const productIds = data.content.clearance.productIds;
        const products = productIds
          .map((id: string) => getProductById(id))
          .filter(Boolean) as Product[];
        
        setAllProducts(products);
        setFilteredProducts(products);
      }
    } catch (error) {
      console.error("Error loading clearance products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  {language === "fr" ? "Chargement..." : "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const categoryName = language === "fr" ? "Déstockage" : "Clearance";

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-600 text-white p-2 rounded-lg">
                <Tag className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                {categoryName}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              {language === "fr" 
                ? "Découvrez nos produits en déstockage à prix réduits" 
                : "Discover our clearance products at reduced prices"}
            </p>
            <p className="text-gray-500 mt-2">
              {filteredProducts.length} {language === "fr" ? "produit(s) trouvé(s)" : "product(s) found"}
            </p>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === "fr" ? "Aucun produit en déstockage" : "No clearance products"}
              </h2>
              <p className="text-gray-600">
                {language === "fr" 
                  ? "Il n'y a actuellement aucun produit en déstockage. Revenez bientôt pour découvrir nos offres spéciales !"
                  : "There are currently no clearance products. Come back soon to discover our special offers!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar avec filtres */}
              <aside className="w-full lg:w-64 flex-shrink-0">
                <ProductFilters 
                  products={allProducts} 
                  category="destockage"
                  onFilterChange={setFilteredProducts}
                />
              </aside>
              
              {/* Contenu principal avec grille de produits */}
              <div className="flex-1">
                <ProductGrid products={filteredProducts} />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

