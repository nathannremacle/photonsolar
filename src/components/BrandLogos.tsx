"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const brands = [
  { name: "Easee", link: "/collections/easee" },
  { name: "Eurener", link: "/collections/eurener" },
  { name: "Growatt", link: "/collections/growatt" },
  { name: "Jinko Solar", link: "/collections/jinko-solar" },
  { name: "Longi", link: "/collections/longi" },
  { name: "Peblar", link: "/collections/peblar" },
  { name: "Schletter", link: "/collections/schletter" },
  { name: "SMA", link: "/collections/sma" },
  { name: "Smappee", link: "/collections/smappee" },
  { name: "Solaredge", link: "/collections/solaredge" },
  { name: "Staubli", link: "/collections/staubli" },
  { name: "Sunbeam", link: "/collections/sunbeam" },
  { name: "Sunpower", link: "/collections/sunpower" },
  { name: "Trina Solar", link: "/collections/trinasolar" },
  { name: "V2C", link: "/collections/v2c" },
  { name: "Wallbox", link: "/collections/wallbox" },
];

export default function BrandLogos() {
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

