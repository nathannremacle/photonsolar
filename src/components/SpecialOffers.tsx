"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { SpecialOffer } from "@/lib/homepage-storage";
import { safeFetchJson } from "@/utils/api";

export default function SpecialOffers() {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await safeFetchJson<{ content: any }>("/api/homepage");
      if (error) {
        console.error("Error loading special offers:", error);
        return;
      }
      if (data?.content) {
        setOffers(data.content.specialOffers || []);
      }
    } catch (error) {
      console.error("Error loading special offers:", error);
    }
  };

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Offre de cashback SMA & kits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${offer.backgroundImage ? '' : offer.bgColor} rounded-2xl p-8 text-white relative overflow-hidden`}
              style={offer.backgroundImage ? {
                backgroundImage: `url(${offer.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {offer.backgroundImage && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl"></div>
              )}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">{offer.title}</h3>
                <p className="text-white/90 mb-6">{offer.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {offer.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-white font-bold mt-1">✓</span>
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>

                {offer.note && (
                  <p className="text-white/80 text-sm mb-6 italic">{offer.note}</p>
                )}

                <Link
                  href={offer.ctaLink}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  {offer.cta}
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
