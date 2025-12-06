"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const promotions = [
  {
    id: 1,
    badge: "PROMO",
    title: "Baisse de prix significative sur la gamme SMA Hybride",
    description: "Les performances SMA, désormais plus accessibles pour tous vos projets hybrides.",
    features: [
      "Réduction permanente du prix des onduleurs hybrides SMA",
      "Autoconsommation maximisée",
      "Triphasé et monophasé",
      "Garantie 5+5 ans",
    ],
    cta: "J'en profite!",
    ctaLink: "/collections/hybrides",
    bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  {
    id: 2,
    badge: "Nouveau",
    title: "Panneau Jinko JKM460N - Full Black",
    description: "Un panneau noir intégral hautement performant et durable pour vos installations résidentielles.",
    features: [
      "Destiné à un usage résidentiel : full black – esthétique parfaite",
      "Garantie du produit : 25 ans",
      "Rendement : jusqu'à 23,02 %",
      "En stock",
    ],
    cta: "En savoir plus",
    ctaLink: "/products/jinko-jkm460n",
    bgColor: "bg-gradient-to-br from-gray-800 to-gray-900",
  },
  {
    id: 3,
    badge: "NOUVEAU AU CATALOGUE",
    title: "Onduleurs hybrides et batteries SolaX",
    description: "Une solution hybride complète et intelligente pour optimiser chaque installation.",
    features: [
      "Onduleurs hybrides avec écran – CT et dongle inclus",
      "Fonctionnement de secours intégré avec ou sans batteries",
      "Gestion intelligente de la charge",
    ],
    cta: "Découvrir",
    ctaLink: "/collections/solax",
    bgColor: "bg-gradient-to-br from-blue-600 to-blue-700",
  },
];

export default function Promotions() {
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

