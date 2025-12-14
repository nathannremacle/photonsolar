"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, ChevronDown, Globe, User, LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryIcon } from "@/utils/productIcons";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { getTotalItems, openCart } = useCart();

  // Handle scroll effect pour l'ombre
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setLanguageDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const topMenuItems = [
    { name: t("nav.home"), key: "nav.home", href: "/" },
    { name: t("nav.downloads"), key: "nav.downloads", href: "/telechargements" },
    { name: t("nav.news"), key: "nav.news", href: "/blogs/news" },
    { name: t("nav.contact"), key: "nav.contact", href: "/contact" },
  ];

  // Mapping des hrefs vers les catégories pour les icônes
  const getCategoryFromHref = (href: string): string => {
    const categoryMap: Record<string, string> = {
      "/collections/panneaux-solaires": "panneaux-solaires",
      "/collections/onduleurs": "onduleurs",
      "/collections/batteries-stockage": "batteries-stockage",
      "/collections/structure-montage": "structure-montage",
      "/collections/borne-recharge": "borne-recharge",
      "/collections/pompe-chaleur": "pompe-chaleur",
      "/collections/batterie-plug-play": "batterie-plug-play",
      "/collections/poeles-cheminee": "poeles-cheminee",
      "/collections/climatiseur": "climatiseur",
    };
    return categoryMap[href] || "";
  };

  const mainMenuItems = [
    {
      name: t("nav.solarPanels"),
      key: "nav.solarPanels",
      href: "/collections/panneaux-solaires",
      category: "panneaux-solaires",
    },
    {
      name: t("nav.inverters"),
      key: "nav.inverters",
      href: "/collections/onduleurs",
      category: "onduleurs",
      submenu: [
        { name: t("nav.hybrid"), key: "nav.hybrid", href: "/collections/onduleurs?subcategory=hybride" },
        { name: t("nav.onGrid"), key: "nav.onGrid", href: "/collections/onduleurs?subcategory=on-grid" },
        { name: t("nav.microInverter"), key: "nav.microInverter", href: "/collections/onduleurs?subcategory=micro-onduleur" },
      ],
    },
    {
      name: t("nav.batteries"),
      key: "nav.batteries",
      href: "/collections/batteries-stockage",
      category: "batteries-stockage",
    },
    {
      name: t("nav.mounting"),
      key: "nav.mounting",
      href: "/collections/structure-montage",
      category: "structure-montage",
    },
    {
      name: t("nav.charging"),
      key: "nav.charging",
      href: "/collections/borne-recharge",
      category: "borne-recharge",
    },
    {
      name: t("nav.heatPump"),
      key: "nav.heatPump",
      href: "/collections/pompe-chaleur",
      category: "pompe-chaleur",
      submenu: [
        { name: t("nav.heatPumpMain"), key: "nav.heatPumpMain", href: "/collections/pompe-chaleur" },
        { name: t("nav.heatPumpPool"), key: "nav.heatPumpPool", href: "/collections/pompe-chaleur?subcategory=piscine" },
        { name: t("nav.thermodynamic"), key: "nav.thermodynamic", href: "/collections/pompe-chaleur?subcategory=ballon-thermodynamique" },
        { name: t("nav.heatingAccessories"), key: "nav.heatingAccessories", href: "/collections/pompe-chaleur?subcategory=accessoires" },
      ],
    },
    {
      name: t("nav.plugPlay"),
      key: "nav.plugPlay",
      href: "/collections/batterie-plug-play",
      category: "batterie-plug-play",
    },
    {
      name: t("nav.stoves"),
      key: "nav.stoves",
      href: "/collections/poeles-cheminee",
      category: "poeles-cheminee",
    },
    {
      name: t("nav.airConditioner"),
      key: "nav.airConditioner",
      href: "/collections/climatiseur",
      category: "climatiseur",
    },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-sm py-2 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <ul className="hidden lg:flex items-center space-x-6">
              {topMenuItems.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-orange-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 ml-auto">
              <div className="relative flex items-center gap-2" ref={languageDropdownRef}>
                <span className="text-gray-400">{t("nav.language")}</span>
                <button
                  onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                  className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                >
                  <Globe size={16} />
                  <span>{language.toUpperCase()}</span>
                  <ChevronDown size={14} className={`transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {languageDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] min-w-[120px]">
                    <button
                      onClick={() => {
                        setLanguage("fr");
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${
                        language === "fr" ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-700"
                      }`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("en");
                        setLanguageDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition-colors ${
                        language === "en" ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-700"
                      }`}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-white"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.jpg"
                alt="Photon Solar"
                width={180}
                height={60}
                className="object-contain h-14 w-auto"
              />
            </Link>

            {/* Search */}
            <form 
              className="hidden md:flex flex-1 max-w-md mx-8"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const query = formData.get("search") as string;
                if (query && query.trim().length > 0) {
                  router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                }
              }}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  name="search"
                  placeholder={t("nav.search")}
                  className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-600 hover:text-orange-700 transition-colors"
                  aria-label={t("nav.search")}
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-6">
              {/* Cart Button */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-700 hover:text-[#E67E22] transition-colors"
                aria-label={language === "fr" ? "Ouvrir le panier" : "Open cart"}
              >
                <ShoppingCart size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              <Link href="/contact" className="text-gray-700 hover:text-[#E67E22] transition-colors font-medium">
                {t("nav.contactUs")}
              </Link>
              {status === "loading" ? (
                <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : session ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 text-gray-700 hover:text-[#E67E22] transition-colors font-medium"
                  >
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user?.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span className="hidden lg:inline">{session.user?.name || session.user?.email}</span>
                    <ChevronDown size={16} className={`transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User size={16} />
                        Mon profil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Déconnexion
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-gray-700 hover:text-[#E67E22] transition-colors font-medium">
                  {t("nav.login")}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Main Navigation Menu */}
          <div className="hidden lg:flex items-center justify-center border-t border-gray-200 py-2">
            <ul className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-wrap justify-center">
              {mainMenuItems.map((item) => {
                const categoryIcon = item.category ? getCategoryIcon(item.category) : null;
                return (
                  <li key={item.key} className="relative group">
                    {item.submenu ? (
                      <>
                        <button
                          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#E67E22] transition-colors font-medium py-1 px-1.5 sm:px-2"
                          onMouseEnter={() => setOpenDropdown(item.key)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {categoryIcon && (
                            <div className={`${categoryIcon.bgColor} rounded-full p-1.5 sm:p-2`}>
                              <categoryIcon.icon 
                                size={16} 
                                className={`${categoryIcon.color} sm:w-[18px] sm:h-[18px]`} 
                              />
                            </div>
                          )}
                          <span className="text-[9px] sm:text-[10px] text-center leading-tight whitespace-nowrap">{item.name}</span>
                          <ChevronDown size={9} className={`transition-transform ${openDropdown === item.key ? 'rotate-180' : ''} mt-0.5 sm:w-[10px] sm:h-[10px]`} />
                        </button>
                      <AnimatePresence>
                        {openDropdown === item.key && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            onMouseEnter={() => setOpenDropdown(item.key)}
                            onMouseLeave={() => setOpenDropdown(null)}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                          >
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.key}
                                href={subItem.href}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#E67E22] transition-colors"
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#E67E22] transition-colors font-medium py-1 px-1.5 sm:px-2"
                    >
                      {categoryIcon && (
                        <div className={`${categoryIcon.bgColor} rounded-full p-1.5 sm:p-2`}>
                          <categoryIcon.icon 
                            size={16} 
                            className={`${categoryIcon.color} sm:w-[18px] sm:h-[18px]`} 
                          />
                        </div>
                      )}
                      <span className="text-[9px] sm:text-[10px] text-center leading-tight whitespace-nowrap">{item.name}</span>
                    </Link>
                  )}
                </li>
              );
              })}
              <li>
                <Link href="/promo" className="text-gray-700 hover:text-[#E67E22] transition-colors font-medium">
                  {t("nav.promo")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-white md:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-6 pb-8 overflow-y-auto">
              <div className="flex flex-col space-y-4">
                {mainMenuItems.map((item) => {
                  const categoryIcon = item.category ? getCategoryIcon(item.category) : null;
                  return (
                    <div key={item.key}>
                      {item.submenu ? (
                        <>
                          <button
                            className="text-xl font-bold text-gray-800 hover:text-[#E67E22] transition-colors w-full text-left flex items-center justify-between"
                            onClick={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                          >
                            <span className="flex items-center gap-2">
                              {categoryIcon && (
                                <categoryIcon.icon 
                                  size={20} 
                                  className={categoryIcon.color} 
                                />
                              )}
                              {item.name}
                            </span>
                            <ChevronDown size={20} className={`transition-transform ${openDropdown === item.key ? 'rotate-180' : ''}`} />
                          </button>
                        {openDropdown === item.key && (
                          <div className="mt-2 ml-4 space-y-2">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.key}
                                href={subItem.href}
                                className="block text-gray-600 hover:text-[#E67E22] transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex flex-col items-center gap-2 py-3"
                        onClick={() => setIsOpen(false)}
                      >
                        {categoryIcon && (
                          <div className={`${categoryIcon.bgColor} rounded-full p-4`}>
                            <categoryIcon.icon 
                              size={32} 
                              className={categoryIcon.color} 
                            />
                          </div>
                        )}
                        <span className="text-lg font-bold text-gray-800 hover:text-[#E67E22] transition-colors text-center">
                          {item.name}
                        </span>
                      </Link>
                    )}
                  </div>
                );
                })}
                <Link
                  href="/promo"
                  className="text-xl font-bold text-gray-800 hover:text-[#E67E22] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {t("nav.promo")}
                </Link>
                
                {/* Mobile Auth Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  {status === "loading" ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : session ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-4">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user?.name || "User"}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                            {session.user?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {session.user?.name || "Utilisateur"}
                          </p>
                          <p className="text-sm text-gray-600">{session.user?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="block text-lg font-semibold text-gray-800 hover:text-[#E67E22] transition-colors flex items-center gap-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <User size={20} />
                        Mon profil
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                        className="w-full text-left text-lg font-semibold text-gray-800 hover:text-[#E67E22] transition-colors flex items-center gap-2"
                      >
                        <LogOut size={20} />
                        Déconnexion
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="block text-xl font-bold text-gray-800 hover:text-[#E67E22] transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {t("nav.login")}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
