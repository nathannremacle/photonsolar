"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Brand } from "@/lib/homepage-storage";

export default function BrandLogos() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/homepage");
      const data = await response.json();
      if (response.ok && data.content) {
        setBrands(data.content.brands?.items || []);
        setEnabled(data.content.brands?.enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  if (!enabled || brands.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <Link
                href={brand.link}
                className="block aspect-square bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors p-4"
              >
                <span className="text-gray-400 text-xs font-semibold text-center group-hover:text-gray-600 transition-colors">
                  {brand.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
