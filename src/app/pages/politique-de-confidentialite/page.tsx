"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PolitiqueConfidentialitePage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {language === "fr"
              ? "Politique de confidentialité"
              : "Privacy Policy"}
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "1. Responsable du traitement" : "1. Data controller"}
              </h2>
              <p>
                {language === "fr"
                  ? "Photon Solar (ci-après « nous ») est responsable du traitement des données personnelles collectées via ce site. Pour toute question relative à vos données, vous pouvez nous contacter via la page Contact."
                  : "Photon Solar (hereinafter \"we\") is responsible for the processing of personal data collected through this site. For any questions regarding your data, you can contact us via the Contact page."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "2. Données collectées" : "2. Data collected"}
              </h2>
              <p className="mb-4">
                {language === "fr"
                  ? "Nous pouvons collecter les données suivantes lorsque vous utilisez notre site ou créez un compte :"
                  : "We may collect the following data when you use our site or create an account:"}
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>{language === "fr" ? "Nom et prénom" : "First and last name"}</li>
                <li>{language === "fr" ? "Adresse email" : "Email address"}</li>
                <li>{language === "fr" ? "Numéro de téléphone" : "Phone number"}</li>
                <li>{language === "fr" ? "Nom de l'entreprise (pour les professionnels)" : "Company name (for professionals)"}</li>
                <li>{language === "fr" ? "Données de navigation (cookies, logs)" : "Browsing data (cookies, logs)"}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "3. Finalités du traitement" : "3. Purposes of processing"}
              </h2>
              <p>
                {language === "fr"
                  ? "Vos données sont utilisées pour la gestion de votre compte, la prise de contact, la réponse à vos demandes, l'envoi d'informations relatives à nos services (avec votre accord), et le respect de nos obligations légales."
                  : "Your data is used for account management, contact handling, responding to your requests, sending information about our services (with your consent), and compliance with our legal obligations."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "4. Base légale" : "4. Legal basis"}
              </h2>
              <p>
                {language === "fr"
                  ? "Le traitement repose sur votre consentement (création de compte, newsletter), l'exécution d'un contrat (devis, commandes) ou notre intérêt légitime (amélioration du site, sécurité)."
                  : "Processing is based on your consent (account creation, newsletter), performance of a contract (quotes, orders), or our legitimate interest (site improvement, security)."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "5. Conservation" : "5. Retention"}
              </h2>
              <p>
                {language === "fr"
                  ? "Les données sont conservées pendant la durée nécessaire aux finalités précitées, puis supprimées ou anonymisées, sauf obligation légale de conservation."
                  : "Data is retained for as long as necessary for the above purposes, then deleted or anonymized, unless legal retention obligations apply."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "6. Vos droits" : "6. Your rights"}
              </h2>
              <p className="mb-4">
                {language === "fr"
                  ? "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation du traitement, de portabilité et d'opposition. Vous pouvez introduire une réclamation auprès de l'autorité de contrôle compétente."
                  : "In accordance with the GDPR, you have the right to access, rectify, erase, restrict processing, data portability, and to object. You may lodge a complaint with the competent supervisory authority."}
              </p>
              <p>
                {language === "fr"
                  ? "Pour exercer ces droits, contactez-nous via la page Contact ou par email."
                  : "To exercise these rights, contact us via the Contact page or by email."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "7. Cookies" : "7. Cookies"}
              </h2>
              <p>
                {language === "fr"
                  ? "Le site utilise des cookies pour le bon fonctionnement (session, préférences) et, le cas échéant, l'analyse d'audience. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur."
                  : "The site uses cookies for proper operation (session, preferences) and, where applicable, audience analysis. You can manage your preferences in your browser settings."}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "fr" ? "8. Modifications" : "8. Changes"}
              </h2>
              <p>
                {language === "fr"
                  ? "Cette politique peut être mise à jour. La date de dernière mise à jour sera indiquée. Nous vous invitons à la consulter régulièrement."
                  : "This policy may be updated. The last update date will be indicated. We invite you to consult it regularly."}
              </p>
              <p className="text-sm text-gray-500 mt-4">
                {language === "fr" ? "Dernière mise à jour : " : "Last updated: "}
                {new Date().toLocaleDateString(language === "fr" ? "fr-BE" : "en-GB")}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
