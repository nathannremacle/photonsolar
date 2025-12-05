"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pb-20 bg-slate-950"
    >
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Darker gradient for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950 z-10" />
        {/* Fallback gradient if image fails */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-900 z-0" />
        {/* Overlay to ensure readability */}
        <div className="absolute inset-0 bg-black/40 z-20" />
        
        {/* Uncomment this when image is available
        <Image
          src="/hero-solar.jpg"
          alt="Installation solaire premium"
          fill
          className="object-cover scale-105 animate-slow-zoom"
          priority
          quality={90}
        />
        */}
      </div>

      {/* Content Container */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content - Text */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-bold border border-white/20 mb-6"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
              Leader du photovoltaïque en Wallonie
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Transformez le soleil en <br className="hidden lg:block" />
              <span className="text-primary-300 drop-shadow-lg">
                énergie durable
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-100 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0 drop-shadow-md font-medium">
              Autonomie énergétique, économies garanties et technologie de pointe. 
              Rejoignez les 5000+ foyers belges qui ont choisi l'excellence Photon Solar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link
                href="#contact"
                className="group bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-glow hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Obtenir mon devis
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                href="#realisations"
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-white/10 hover:border-white/20 flex items-center justify-center"
              >
                Voir nos projets
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-gray-200 text-sm font-semibold">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary-400" size={20} />
                <span className="drop-shadow-sm">Garantie 30 ans</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="text-primary-400" size={20} />
                <span className="drop-shadow-sm">Installation Express</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-primary-400" size={20} />
                <span className="drop-shadow-sm">Agréé RESCert</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Abstract Visual/Stats */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="flex-1 relative hidden lg:block"
          >
            {/* Floating Cards Composition */}
            <div className="relative w-full h-[600px]">
              
              {/* Main Card - Solar Panel Visual (Abstract) */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-10 w-80 h-96 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden p-6"
              >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="relative z-10">
                   <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="text-primary-500" size={24} />
                   </div>
                   <h3 className="text-white text-xl font-bold mb-2">Performance Max</h3>
                   <p className="text-gray-100 text-sm font-semibold drop-shadow-sm">Panneaux monocristallins de dernière génération pour un rendement optimal même par temps nuageux.</p>
                   
                   {/* Graph placeholder */}
                   <div className="mt-8 h-32 flex items-end justify-between gap-2">
                      {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                        <div key={i} className="w-full bg-primary-500/20 rounded-t-sm relative group overflow-hidden">
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: `${h}%` }}
                             transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                             className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-600 to-primary-400"
                           />
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>

              {/* Secondary Card - Savings */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 left-0 w-72 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-glass"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-green-500/20 rounded-full text-green-300 border border-green-400/30">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-gray-100 text-xs font-bold uppercase tracking-wider drop-shadow-sm">Économies annuelles</p>
                    <p className="text-white text-2xl font-extrabold drop-shadow-md">~1.850 €</p>
                    <p className="text-gray-100 text-[11px] font-semibold tracking-wide drop-shadow-sm">d'économies / an</p>
                  </div>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-2 border border-white/10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "85%" }}
                     transition={{ duration: 1.5, delay: 1 }}
                     className="h-full bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                   />
                </div>
                <p className="text-gray-100 text-xs text-right font-medium drop-shadow-sm">Basé sur une famille de 4 pers.</p>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-off to-transparent z-20" />
    </section>
  );
}
