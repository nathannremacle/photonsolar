"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Promotion } from "@/lib/homepage-storage";

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();
      if (response.ok && data.content) {
        setPromotions(data.content.promotions || []);
      }
    } catch (error) {
      console.error("Error loading promotions:", error);
    }
  };

  if (promotions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-lg group"
            >
              <div className={`${promo.bgColor} p-8 text-white h-full flex flex-col`}>
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase">
                  {promo.badge}
                </span>
                
                <h3 className="text-2xl font-bold mb-4 leading-tight">
                  {promo.title}
                </h3>
                
                <p className="text-white/90 mb-6 flex-grow">
                  {promo.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {promo.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-white font-bold mt-1">✓</span>
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={promo.ctaLink}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors w-fit group-hover:gap-3"
                >
                  {promo.cta}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
