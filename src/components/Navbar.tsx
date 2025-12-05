"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { name: "Accueil", href: "#accueil" },
    { name: "Solutions", href: "#services" },
    { name: "Pourquoi Nous", href: "#expertise" },
    { name: "Réalisations", href: "#realisations" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={
          scrolled
            ? "fixed top-0 w-full z-50 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 py-3"
            : "fixed top-0 w-full z-50 transition-all duration-300 bg-transparent py-5"
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`p-2 rounded-lg shadow-glow transition-all duration-300 ${scrolled ? "bg-white" : "bg-white/10"}`}>
                <Sun size={24} className={scrolled ? "text-[#E67E22]" : "text-white"} />
              </div>
              <div className={`text-2xl font-bold tracking-tight ${scrolled ? "text-secondary-900" : "text-white drop-shadow"}`}>
                Photon<span className="text-primary-500">Solar</span>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold tracking-wide hover:text-primary-400 transition-colors duration-200 relative group ${
                    scrolled ? 'text-secondary-800' : 'text-white drop-shadow-sm'
                  }`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
              <Link
                href="#contact"
                className="bg-[#E67E22] hover:bg-[#D35400] text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:-translate-y-0.5"
              >
                Devis Gratuit
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 rounded-md transition-colors ${
                scrolled ? 'text-secondary-800 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white md:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-6 pb-8">
              <div className="flex flex-col space-y-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-2xl font-bold text-secondary-800 hover:text-primary-500 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="#contact"
                  className="bg-primary-500 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-primary-600 transition-colors mt-8"
                  onClick={() => setIsOpen(false)}
                >
                  Demander un devis
                </Link>
              </div>
              
              <div className="mt-auto">
                <p className="text-secondary-400 text-sm text-center">
                  © {new Date().getFullYear()} Photon Solar
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
