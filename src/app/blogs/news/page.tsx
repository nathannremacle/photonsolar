"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const newsItems = [
  {
    id: 1,
    category: "News",
    title: "Wallonie : un tournant énergétique décisif – Le rôle d'Ecostal dans cette transformation",
    date: "3 December 2025",
    excerpt: "La Wallonie connaît un tournant énergétique majeur avec l'arrivée de nouvelles politiques et technologies. Découvrez comment Ecostal contribue à cette transformation.",
    link: "/blogs/news/wallonia-energy-turning-point",
  },
  {
    id: 2,
    category: "News",
    title: "Vincent Maurice rejoint Ecostal pour piloter les activités de Distribution",
    date: "11 September 2025",
    excerpt: "Ecostal annonce l'arrivée de Vincent Maurice à la tête de ses activités de distribution. Une nomination stratégique pour renforcer la présence sur le marché belge.",
    link: "/blogs/news/vincent-maurice-joins-ecostal",
  },
];

export default function NewsPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {language === "fr" ? "Actualités" : "News"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {newsItems.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <Link href={item.link} className="block">
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Image article</span>
                    </div>
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
        </div>
      </div>
      <Footer />
    </main>
  );
}

