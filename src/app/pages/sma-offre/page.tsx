"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gift, CheckCircle, Calendar } from "lucide-react";
import Link from "next/link";

export default function SMAOffrePage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-8 h-8" />
              <h1 className="text-4xl font-bold">
                {language === "fr"
                  ? "Offre de cashback SMA & kits de modernisation"
                  : "SMA Cashback Offer & Modernization Kits"}
              </h1>
            </div>
          </div>

          <div className="space-y-8">
            {/* Cashback Section */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === "fr"
                  ? "Offre de cashback prolongée jusqu'au 31/12/2025 !"
                  : "Cashback offer extended until 12/31/2025!"}
              </h2>
              <p className="text-gray-700 mb-6">
                {language === "fr"
                  ? "Participer à la campagne est un jeu d'enfant pour les entreprises d'installation :"
                  : "Participating in the campaign is child's play for installation companies:"}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr"
                      ? "Achetez et installez les appareils SMA éligibles"
                      : "Purchase and install eligible SMA devices"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr"
                      ? "Enregistrez les appareils via les systèmes SMA"
                      : "Register devices via SMA systems"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr"
                      ? "Recevez automatiquement votre montant de cashback"
                      : "Automatically receive your cashback amount"}
                  </span>
                </li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  {language === "fr"
                    ? "Inscription possible jusqu'au 30/11/2025. Après cette date, seules les entreprises déjà enregistrées pourront continuer à cumuler du cashback jusqu'au 31/12/2025."
                    : "Registration possible until 11/30/2025. After this date, only already registered companies will be able to continue accumulating cashback until 12/31/2025."}
                </p>
              </div>
            </section>

            {/* Modernization Kits Section */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {language === "fr"
                  ? "Kits de modernisation SMA – prêts pour l'avenir !"
                  : "SMA Modernization Kits – Ready for the Future!"}
              </h2>
              <p className="text-gray-700 mb-6">
                {language === "fr"
                  ? "Pourquoi choisir les kits de modernisation SMA ?"
                  : "Why choose SMA modernization kits?"}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr" ? "Un package tout-en-un" : "An all-in-one package"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr" ? "Une offre attractive" : "An attractive offer"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr"
                      ? "Prêts pour une gestion intelligente de l'énergie"
                      : "Ready for smart energy management"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr"
                      ? "Une installation simplifiée"
                      : "Simplified installation"}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {language === "fr"
                      ? "Une forte demande sur le marché"
                      : "Strong market demand"}
                  </span>
                </li>
              </ul>
            </section>

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/collections/onduleurs"
                className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-primary-700 transition-colors"
              >
                {language === "fr"
                  ? "Voir les produits SMA"
                  : "View SMA Products"}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

