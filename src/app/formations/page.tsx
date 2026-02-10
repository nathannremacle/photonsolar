"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowRight, Calendar, GraduationCap } from "lucide-react";
import { safeFetchJson } from "@/utils/api";

interface Formation {
  id: number;
  order: number;
  title: string;
  date: string;
  excerpt: string;
  link: string;
  image?: string;
}

export default function FormationsPage() {
  const { language } = useLanguage();
  const [items, setItems] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    try {
      const { data, error } = await safeFetchJson<{ formations: Formation[] }>("/api/formations");
      if (error) {
        console.error("Error loading formations:", error);
        return;
      }
      if (data?.formations) {
        setItems(data.formations);
      }
    } catch (error) {
      console.error("Error loading formations:", error);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
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

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {language === "fr" ? "Photon Académie" : "Photon Academy"}
            </h1>
            <p className="text-lg text-gray-600">
              {language === "fr"
                ? "Formations et sessions dédiées au solaire et à l’énergie."
                : "Training sessions dedicated to solar and energy."}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {language === "fr"
                  ? "Aucune formation disponible pour le moment."
                  : "No formations available at the moment."}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {language === "fr"
                  ? "Revenez bientôt pour découvrir nos prochaines sessions."
                  : "Check back soon for our upcoming sessions."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100"
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
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                          <GraduationCap className="w-16 h-16 text-orange-400" />
                        </div>
                      )}
                      <span className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {language === "fr" ? "Formation" : "Training"}
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
                        {language === "fr" ? "Voir la formation" : "View formation"}
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
