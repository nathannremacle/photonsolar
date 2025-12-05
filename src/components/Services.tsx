"use client";

import { motion } from "framer-motion";
import { Sun, Battery, Zap, Wrench, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function Services() {
  return (
    <section id="services" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute top-[20%] left-[5%] w-[20%] h-[20%] rounded-full bg-blue-50/60 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary-600 font-semibold tracking-wider uppercase text-sm"
          >
            Nos Solutions
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-4xl sm:text-5xl font-bold text-secondary-900 tracking-tight"
          >
            L'énergie de demain <br />
            <span className="text-primary-600 drop-shadow-sm">
              disponible aujourd'hui
            </span>
          </motion.h2>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-[300px]">
          
          {/* Main Service - Photovoltaic - Spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 group relative overflow-hidden bg-white rounded-3xl shadow-soft hover:shadow-float transition-all duration-500 border border-gray-100 p-8 flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 origin-top-right">
               <Sun size={200} className="text-primary-500" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors duration-500">
                <Sun size={32} className="text-primary-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-950 mb-3">Installation Photovoltaïque</h3>
              <p className="text-secondary-800 font-medium leading-relaxed max-w-md">
                Des panneaux solaires Haute performance (Bifacial, Topcon) garantissant un rendement exceptionnel. 
                Solution clé en main pour particuliers et industriels.
              </p>
            </div>
            
            <div className="relative z-10 pt-8">
              <Link href="#contact" className="inline-flex items-center gap-2 text-primary-700 font-bold hover:text-primary-800 group-hover:gap-3 transition-all">
                En savoir plus <ArrowUpRight size={18} strokeWidth={3} />
              </Link>
            </div>
          </motion.div>

          {/* Battery Storage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative overflow-hidden bg-slate-900 text-white rounded-3xl shadow-soft hover:shadow-float transition-all duration-500 p-8 flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:bg-primary-500 transition-colors duration-500">
                <Battery size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">Batteries & Stockage</h3>
              <p className="text-gray-100 text-sm font-medium leading-relaxed">
                Maximisez votre autoconsommation en stockant l'énergie produite pour l'utiliser la nuit.
              </p>
            </div>
          </motion.div>

          {/* EV Charging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative overflow-hidden bg-white rounded-3xl shadow-soft hover:shadow-float transition-all duration-500 border border-gray-100 p-8 flex flex-col justify-between"
          >
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
             
            <div className="relative z-10">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent transition-colors duration-500">
                <Zap size={32} className="text-accent-600 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl font-bold text-secondary-950 mb-2">Bornes de Recharge</h3>
              <p className="text-secondary-800 text-sm font-medium leading-relaxed">
                Chargez votre véhicule électrique avec votre propre électricité verte. Installation intelligente et connectée.
              </p>
            </div>
          </motion.div>

          {/* Maintenance - Spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 group relative overflow-hidden bg-white rounded-3xl shadow-soft hover:shadow-float transition-all duration-500 border border-gray-100 p-8 flex flex-row items-center gap-8"
          >
            <div className="flex-1 relative z-10">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-secondary-900 transition-colors duration-500">
                <Wrench size={32} className="text-secondary-800 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-950 mb-3">Maintenance Premium</h3>
              <p className="text-secondary-800 font-medium leading-relaxed">
                Nous assurons le suivi, le nettoyage et le dépannage de vos installations pour garantir leur longévité et leur rendement optimal année après année.
              </p>
            </div>
            <div className="hidden md:block w-1/3 h-full relative rounded-2xl overflow-hidden bg-gray-100">
               {/* Placeholder for maintenance image */}
               <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400">
                  <Wrench size={48} className="opacity-20" />
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
