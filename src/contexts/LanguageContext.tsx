"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.downloads": "Téléchargements",
    "nav.news": "News",
    "nav.contact": "Contact",
    "nav.account": "Mon compte",
    "nav.solarPanels": "Panneaux Solaires",
    "nav.inverters": "Onduleurs",
    "nav.hybrid": "Hybride",
    "nav.onGrid": "ON GRID",
    "nav.microInverter": "Micro Onduleur 800W à 2000W",
    "nav.batteries": "Batteries & Stockage",
    "nav.mounting": "Structure de Montage",
    "nav.charging": "Borne de Recharge",
    "nav.heatPump": "Pompe à Chaleur",
    "nav.heatPumpMain": "Pompe À Chaleur",
    "nav.heatPumpPool": "Pompe à chaleur Piscine",
    "nav.thermodynamic": "Ballon Thermodynamique",
    "nav.heatingAccessories": "Accessoires chauffages",
    "nav.plugPlay": "Batterie Plug & Play",
    "nav.stoves": "Poélés & Cheminée",
    "nav.airConditioner": "Climatiseur",
    "nav.promo": "PROMO",
    "nav.search": "Recherche",
    "nav.contactUs": "Contactez-nous",
    "nav.login": "Connexion",
    "nav.language": "Langue",
    // Footer
    "footer.hours": "Horaires",
    "footer.hoursWeek": "Lun-Ven: 9 AM – 5 PM",
    "footer.hoursWeekend": "Samedi / Dimanche: Fermé",
    "footer.phone": "Phone",
    "footer.email": "Email",
    "footer.address": "Address",
    "footer.navigation": "Navigation",
    "footer.catalog": "Catalogue de Produits",
    "footer.follow": "Suivez-nous",
    // Common
    "common.seeAll": "Voir tous les produits",
    "common.requestPrice": "Demander le prix",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.downloads": "Downloads",
    "nav.news": "News",
    "nav.contact": "Contact",
    "nav.account": "My Account",
    "nav.solarPanels": "Solar Panels",
    "nav.inverters": "Inverters",
    "nav.hybrid": "Hybrid",
    "nav.onGrid": "ON GRID",
    "nav.microInverter": "Micro Inverter 800W to 2000W",
    "nav.batteries": "Batteries & Storage",
    "nav.mounting": "Mounting Structure",
    "nav.charging": "Charging Station",
    "nav.heatPump": "Heat Pump",
    "nav.heatPumpMain": "Heat Pump",
    "nav.heatPumpPool": "Pool Heat Pump",
    "nav.thermodynamic": "Thermodynamic Tank",
    "nav.heatingAccessories": "Heating Accessories",
    "nav.plugPlay": "Plug & Play Battery",
    "nav.stoves": "Stoves & Fireplace",
    "nav.airConditioner": "Air Conditioner",
    "nav.promo": "PROMO",
    "nav.search": "Search",
    "nav.contactUs": "Contact Us",
    "nav.login": "Login",
    "nav.language": "Language",
    // Footer
    "footer.hours": "Hours",
    "footer.hoursWeek": "Mon-Fri: 9 AM – 5 PM",
    "footer.hoursWeekend": "Saturday / Sunday: Closed",
    "footer.phone": "Phone",
    "footer.email": "Email",
    "footer.address": "Address",
    "footer.navigation": "Navigation",
    "footer.catalog": "Product Catalog",
    "footer.follow": "Follow Us",
    // Common
    "common.seeAll": "See all products",
    "common.requestPrice": "Request price",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "fr" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

