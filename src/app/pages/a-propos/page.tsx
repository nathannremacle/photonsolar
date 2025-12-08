"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {language === "fr" ? "À propos de Photon Solar" : "About Photon Solar"}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "Notre histoire" : "Our Story"}
              </h2>
              <p className="text-gray-700 mb-4">
                {language === "fr" 
                  ? "Depuis 2008, Photon Solar s'impose comme un acteur incontournable dans le domaine de l'énergie solaire en Belgique. Nous vous accompagnons dans votre transition énergétique grâce à une large gamme d'équipements de haute qualité."
                  : "Since 2008, Photon Solar has established itself as a key player in the solar energy sector in Belgium. We support you in your energy transition with a wide range of high-quality equipment."}
              </p>
              <p className="text-gray-700">
                {language === "fr"
                  ? "Notre expertise locale et notre matériel de qualité font de nous le partenaire idéal pour tous vos projets solaires, qu'il s'agisse d'installations résidentielles ou commerciales."
                  : "Our local expertise and quality equipment make us the ideal partner for all your solar projects, whether residential or commercial installations."}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "Notre mission" : "Our Mission"}
              </h2>
              <p className="text-gray-700 mb-4">
                {language === "fr"
                  ? "Notre mission est de rendre l'énergie solaire accessible à tous en proposant des solutions innovantes, performantes et durables. Nous croyons en un avenir énergétique propre et renouvelable."
                  : "Our mission is to make solar energy accessible to everyone by offering innovative, efficient and sustainable solutions. We believe in a clean and renewable energy future."}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "Nos valeurs" : "Our Values"}
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>{language === "fr" ? "Qualité et fiabilité" : "Quality and reliability"}</li>
                <li>{language === "fr" ? "Expertise technique" : "Technical expertise"}</li>
                <li>{language === "fr" ? "Service client exceptionnel" : "Exceptional customer service"}</li>
                <li>{language === "fr" ? "Innovation constante" : "Constant innovation"}</li>
                <li>{language === "fr" ? "Durabilité et respect de l'environnement" : "Sustainability and environmental respect"}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "Contactez-nous" : "Contact Us"}
              </h2>
              <p className="text-gray-700 mb-4">
                {language === "fr"
                  ? "Pour toute question ou demande d'information, n'hésitez pas à nous contacter. Notre équipe est à votre disposition pour vous accompagner dans vos projets."
                  : "For any questions or information requests, please do not hesitate to contact us. Our team is available to support you in your projects."}
              </p>
              <a
                href="/contact"
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                {language === "fr" ? "Nous contacter" : "Contact Us"}
              </a>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

