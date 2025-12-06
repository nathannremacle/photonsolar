"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const newsItems = [
  {
    id: 1,
    category: "News",
    title: "Wallonie : un tournant énergétique décisif – Le rôle d'Ecostal dans cette transformation",
    date: "3 December 2025",
    image: "/placeholder-news.jpg",
    link: "/blogs/news/wallonia-energy-turning-point",
  },
  {
    id: 2,
    category: "News",
    title: "Vincent Maurice rejoint Ecostal pour piloter les activités de Distribution",
    date: "11 September 2025",
    image: "/placeholder-news.jpg",
    link: "/blogs/news/vincent-maurice-joins-ecostal",
  },
];

export default function News() {
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
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Image article</span>
                    </div>
                    <span className="absolute top-4 left-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{item.date}</p>
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all"
                    >
                      En savoir plus
                      <ArrowRight size={16} />
                    </Link>
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

