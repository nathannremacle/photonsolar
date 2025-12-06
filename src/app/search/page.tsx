"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { searchProducts, type Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";

function SearchContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    
    if (query) {
      const results = searchProducts(query);
      setProducts(results);
    } else {
      setProducts([]);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    
    if (query && query.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {language === "fr" ? "Résultats de recherche" : "Search Results"}
        </h1>
        
        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder={language === "fr" ? "Rechercher un produit..." : "Search for a product..."}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              {language === "fr" ? "Rechercher" : "Search"}
            </button>
          </div>
        </form>

        {searchQuery && (
          <>
            <p className="text-gray-600 mb-6">
              {products.length} {language === "fr" ? "produit(s) trouvé(s) pour" : "product(s) found for"} "{searchQuery}"
            </p>
            
            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg mb-4">
                  {language === "fr" 
                    ? "Aucun produit trouvé pour votre recherche." 
                    : "No products found for your search."}
                </p>
                <p className="text-gray-400 text-sm">
                  {language === "fr"
                    ? "Essayez avec d'autres mots-clés ou parcourez nos catégories."
                    : "Try with different keywords or browse our categories."}
                </p>
              </div>
            )}
          </>
        )}

        {!searchQuery && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {language === "fr"
                ? "Entrez un terme de recherche pour commencer."
                : "Enter a search term to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Suspense fallback={
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Chargement...</p>
            </div>
          </div>
        </div>
      }>
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}

