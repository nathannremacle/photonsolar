"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Facebook } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Sun size={24} className="text-orange-500" />
              <span className="text-2xl font-bold">Photon<span className="text-orange-500">Solar</span></span>
            </Link>
            <div className="space-y-2 text-gray-300 text-sm mb-6">
              <p><strong>{t("footer.hours")} :</strong></p>
              <p>{t("footer.hoursWeek")}</p>
              <p>{t("footer.hoursWeekend")}</p>
            </div>
            <div className="space-y-2 text-gray-300 text-sm mb-6">
              <p><strong>{t("footer.phone")}:</strong> +32(0)42859255</p>
              <p><strong>{t("footer.email")}:</strong> info@photonsolar.be</p>
              <p><strong>{t("footer.address")}:</strong> Rue du Fond du Flo 29B 4621 Fléron, Belgique</p>
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">{t("footer.navigation")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link href="/telechargements" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.downloads")}
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link href="/mon-compte" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.account")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Catalogue Column */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">{t("footer.catalog")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/collections/panneaux-solaires" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.solarPanels")}
                </Link>
              </li>
              <li>
                <Link href="/collections/onduleurs" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.inverters")}
                </Link>
              </li>
              <li>
                <Link href="/collections/onduleurs/hybride" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.hybrid")}
                </Link>
              </li>
              <li>
                <Link href="/collections/onduleurs/on-grid" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.onGrid")}
                </Link>
              </li>
              <li>
                <Link href="/collections/batteries-stockage" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.batteries")}
                </Link>
              </li>
              <li>
                <Link href="/collections/structure-montage" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.mounting")}
                </Link>
              </li>
              <li>
                <Link href="/collections/borne-recharge" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.charging")}
                </Link>
              </li>
              <li>
                <Link href="/collections/pompe-chaleur" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.heatPump")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links Column */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">{t("footer.follow")}</h4>
            <div className="flex gap-4 mb-6">
              <a
                href="https://www.instagram.com/photonsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="Instagram"
              >
                <span className="text-white text-sm">IG</span>
              </a>
              <a
                href="https://www.facebook.com/photonsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://www.youtube.com/photonsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-600 transition-colors"
                aria-label="YouTube"
              >
                <span className="text-white text-sm">YT</span>
              </a>
            </div>
            <div className="text-gray-300 text-sm space-y-2">
              <p><strong>{t("footer.hours")} :</strong></p>
              <p>{t("footer.hoursWeek")}</p>
              <p>{t("footer.hoursWeekend")}</p>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-md">
            <h4 className="font-bold text-lg mb-4 text-white">Abonnez-vous à nos e-mails</h4>
            <form className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e-mail"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                S'inscrire
              </button>
            </form>
            <p className="text-gray-400 text-xs mt-2">
              En vous abonnant, vous acceptez de recevoir la newsletter Photon Solar, conformément à notre{" "}
              <Link href="/pages/politique-de-confidentialite" className="underline hover:text-white">
                politique de confidentialité
              </Link>
              {" *"}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear}{" "}
              <Link href="/" className="hover:text-white transition-colors">
                Photon Solar Belgium
              </Link>
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Moyens de paiement</span>
              <div className="flex gap-2">
                {["Bancontact", "Maestro", "Mastercard", "Visa"].map((method) => (
                  <div
                    key={method}
                    className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center"
                    title={method}
                  >
                    <span className="text-xs text-gray-400">{method[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
