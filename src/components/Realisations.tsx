"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";

// Données factices
const projects = [
  {
    id: 1,
    title: "Résidence Moderne",
    location: "Liège",
    power: "8 kWc",
    category: "Résidentiel",
    size: "large", // pour le layout masonry
  },
  {
    id: 2,
    title: "Centre Logistique",
    location: "Namur",
    power: "50 kWc",
    category: "Industriel",
    size: "small",
  },
  {
    id: 3,
    title: "Villa Écologique",
    location: "Bruxelles",
    power: "12 kWc",
    category: "Résidentiel",
    size: "small",
  },
  {
    id: 4,
    title: "Exploitation Agricole",
    location: "Arlon",
    power: "100 kWc",
    category: "Industriel",
    size: "medium",
  },
  {
    id: 5,
    title: "Bureaux Tech",
    location: "Charleroi",
    power: "30 kWc",
    category: "Commercial",
    size: "medium",
  },
];

const categories = [
  { value: "Tous", label: "TOUS" },
  { value: "Résidentiel", label: "RÉSIDENTIEL" },
  { value: "Industriel", label: "INDUSTRIES" },
  { value: "Commercial", label: "COMMERCIAL" },
];

export default function Realisations() {
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredProjects = activeCategory === "Tous" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section id="realisations" className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-primary-600 font-semibold uppercase tracking-[0.3em] text-xs">
            NOS RÉALISATIONS
          </span>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-secondary-900 mb-4">Nos Réalisations</h2>
            <p className="text-secondary-600 font-medium text-lg max-w-xl">
              Découvrez comment nous avons transformé l'avenir énergétique de nos clients à travers la Belgique.
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setActiveCategory(value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === value
                    ? "bg-secondary-900 text-white shadow-md"
                    : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                key={project.id}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer ${
                  project.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
                } ${project.size === 'medium' ? 'md:row-span-1' : ''}`}
              >
                {/* Background Image Placeholder */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  project.category === 'Résidentiel' ? 'from-orange-100 to-orange-200' : 
                  project.category === 'Industriel' ? 'from-blue-100 to-blue-200' : 'from-green-100 to-green-200'
                } transition-transform duration-700 group-hover:scale-105`} />
                
                {/* Actual Image would go here
                <Image ... />
                */}

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1 block drop-shadow-md">
                          {project.category}
                        </span>
                        <h3 className="text-lg font-bold text-secondary-950">{project.title}</h3>
                      </div>
                      <span className="bg-secondary-900 text-white text-xs font-bold px-2 py-1 rounded drop-shadow-md">
                        {project.power}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-secondary-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 drop-shadow-md">
                      <MapPin size={14} />
                      {project.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
}
