"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { safeFetchJson } from "@/utils/api";

interface NewsArticle {
  id: number;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  link: string;
  image?: string;
}

export default function NewsPage() {
  const { language } = useLanguage();
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await safeFetchJson<{ articles: NewsArticle[] }>('/api/news');
      if (error) {
        console.error('Error loading news:', error);
        return;
      }
      if (data?.articles) {
        setNewsItems(data.articles);
      }
    } catch (error) {
      console.error('Error loading news:', error);
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
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {language === "fr" ? "Actualités" : "News"}
          </h1>

          {newsItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucune actualité disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {newsItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <Link href={item.link} className="block">
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Image article</span>
                        </div>
                      )}
                      <span className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{item.date}</span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.excerpt}</p>
                      <div className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all">
                        {language === "fr" ? "Lire la suite" : "Read more"}
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

