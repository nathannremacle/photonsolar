"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Brand } from "@/lib/homepage-storage";
import { safeFetchJson } from "@/utils/api";

export default function BrandLogos() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await safeFetchJson<{ content: any }>("/api/homepage");
      if (error) {
        console.error("Error loading brands:", error);
        return;
      }
      if (data?.content) {
        setBrands(data.content.brands?.items || []);
        setEnabled(data.content.brands?.enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    // Check if it's a URL (http/https) or a path starting with /
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('./')) {
      return true;
    }
    // Check if it contains image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  if (!enabled || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {brands.map((brand, index) => {
            const brandIsImageUrl = isImageUrl(brand.name || '');
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <Link
                  href={brand.link}
                  className="block aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors p-4 overflow-hidden relative"
                >
                  {brandIsImageUrl ? (
                    <Image
                      src={brand.name}
                      alt={`Logo ${index + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('span');
                          fallback.className = 'text-gray-400 text-xs font-semibold text-center group-hover:text-gray-600 transition-colors';
                          fallback.textContent = brand.name || `Marque ${index + 1}`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-xs font-semibold text-center group-hover:text-gray-600 transition-colors">
                      {brand.name || `Marque ${index + 1}`}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
