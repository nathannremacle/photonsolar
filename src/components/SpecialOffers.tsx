"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const offers = [
  {
    id: 1,
    title: "Offre de cashback prolongée jusqu'au 31/12/2025 !",
    description: "Participer à la campagne est un jeu d'enfant pour les entreprises d'installation :",
    features: [
      "Achetez et installez les appareils SMA éligibles",
      "Enregistrez les appareils via les systèmes SMA",
      "Recevez automatiquement votre montant de cashback",
    ],
    note: "Inscription possible jusqu'au 30/11/2025. Après cette date, seules les entreprises déjà enregistrées pourront continuer à cumuler du cashback jusqu'au 31/12/2025.",
    cta: "Découvrir",
    ctaLink: "/pages/sma-offre",
    bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  {
    id: 2,
    title: "Kits de modernisation SMA – prêts pour l'avenir !",
    description: "Pourquoi choisir les kits de modernisation SMA ?",
    features: [
      "Un package tout-en-un",
      "Une offre attractive",
      "Prêts pour une gestion intelligente de l'énergie",
      "Une installation simplifiée",
      "Une forte demande sur le marché",
    ],
    cta: "Découvrir",
    ctaLink: "/pages/sma-offre",
    bgColor: "bg-gradient-to-br from-blue-600 to-blue-700",
  },
];

export default function SpecialOffers() {
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
              className={`${offer.bgColor} rounded-2xl p-8 text-white`}
            >
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

