"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

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
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/photonsolar.png"
                alt="Photon Solar"
                width={180}
                height={48}
                className="h-12 w-auto object-contain"
              />
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
                <Link href="/blogs/news" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link href="/formations" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.photonAcademy")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t("nav.contact")}
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
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/photonsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-600 transition-colors text-white"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/photonsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-600 transition-colors text-white"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/photonsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-600 transition-colors text-white"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-5 h-5" />
              </a>
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
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {currentYear}{" "}
            <Link href="/" className="hover:text-white transition-colors">
              PhotonSolar Belgium
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
