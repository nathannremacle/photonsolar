"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import type { HeroSlide } from "@/lib/homepage-storage";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBanner, setShowBanner] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [banner, setBanner] = useState({
    enabled: true,
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();
      if (response.ok && data.content) {
        setSlides(data.content.heroSlides || []);
        setBanner(data.content.banner || { enabled: true, title: "", subtitle: "", ctaText: "", ctaLink: "" });
        setShowBanner(data.content.banner?.enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading homepage content:", error);
      // Fallback to default slides
      setSlides([
        {
          id: 1,
          badge: "Depuis 2008",
          title: "Pourquoi PhotonSolar ?",
          description: "Depuis 2008, PhotonSolar s'impose comme un acteur incontournable dans le domaine de l'énergie solaire.",
          cta: "En savoir plus",
          ctaLink: "/pages/a-propos",
          bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
        },
      ]);
    }
  };

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Top Banner */}
      {showBanner && banner.enabled && (
        <div className="bg-orange-600 text-white py-3 px-4 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex-1 text-center">
              <h2 className="text-lg font-bold">
                {banner.title || "Bienvenue chez Photon Solar"}
              </h2>
              <p className="text-sm mt-1">{banner.subtitle || "Votre spécialiste en énergie solaire depuis 2008"}</p>
            </div>
            <Link href={banner.ctaLink || "/collections"} className="text-sm underline hover:no-underline mr-4">
              {banner.ctaText || "Voir le catalogue"}
            </Link>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="relative h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => {
            if (index !== currentSlide) return null;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 ${slide.bgColor} flex items-center justify-center`}
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                      {slide.badge}
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-white/90 text-lg md:text-xl mb-8 leading-relaxed">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      {slide.cta}
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{currentSlide + 1}</span>
            <span className="text-white/70">/</span>
            <span className="text-white/70">de</span>
            <span className="text-white font-semibold">{slides.length}</span>
          </div>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            aria-label="Diapositive suivante"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 right-8 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Aller à la diapositive ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
