"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { NewsItem } from "@/lib/homepage-storage";
import { safeFetchJson } from "@/utils/api";

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await safeFetchJson<{ content: any }>("/api/homepage");
      if (error) {
        console.error("Error loading news:", error);
        return;
      }
      if (data?.content) {
        setNewsItems(data.content.news?.items || []);
        setEnabled(data.content.news?.enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading news:", error);
    }
  };

  if (!enabled || newsItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {newsItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link href={item.link} className="block">
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {item.image && item.image !== "/placeholder-news.jpg" ? (
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{item.date}</p>
                    <div className="inline-flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-3 transition-all pointer-events-none">
                      En savoir plus
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
        
        <div className="text-center">
          <Link
            href="/blogs/news"
            className="inline-block text-orange-600 font-semibold hover:text-orange-700 transition-colors"
          >
            Tout afficher
          </Link>
        </div>
      </div>
    </section>
  );
}
