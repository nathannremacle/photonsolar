"use client";

import { motion } from "framer-motion";
import { MapPin, Award, Headset, ShieldCheck, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: <TrendingUp size={24} />,
    title: "Rentabilité Maximale",
    description: "Retour sur investissement en 4 à 5 ans grâce à nos études de dimensionnement précises.",
  },
  {
    icon: <Award size={24} />,
    title: "Matériel Premium",
    description: "Partenaires exclusifs des meilleures marques (SunPower, Huawei, SolarEdge).",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Garantie Totale",
    description: "Jusqu'à 30 ans de garantie produit et performance sur nos panneaux.",
  },
  {
    icon: <Users size={24} />,
    title: "Équipe Locale",
    description: "Pas de sous-traitance. Nos propres équipes installent et assurent le SAV depuis Fléron.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="expertise" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800 h-[600px]">
               {/* Placeholder Image */}
               <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                       <ShieldCheck size={40} className="text-primary-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Certification RESCert</h3>
                    <p className="text-gray-100 font-medium">Nos installateurs sont certifiés et formés en continu.</p>
                  </div>
               </div>
               
               {/* Floating Stats Badge */}
               <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold text-white">15+</p>
                    <p className="text-xs text-gray-200 font-bold uppercase tracking-wider">Années d'expérience</p>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div>
                    <p className="text-3xl font-bold text-white">5k+</p>
                    <p className="text-xs text-gray-200 font-bold uppercase tracking-wider">Clients satisfaits</p>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Pourquoi nous choisir ? <br />
              <span className="text-primary-300 drop-shadow">
                le choix numéro 1
              </span>
            </h2>
            <p className="text-gray-200 text-lg mb-10 leading-relaxed font-medium">
              L'énergie solaire est un investissement sur le long terme. 
              Ne faites aucun compromis sur la qualité de l'installation et du matériel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-lg text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-200 font-medium text-sm leading-relaxed pl-16">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <a href="#contact" className="inline-flex items-center text-white font-semibold border-b-2 border-primary-500 pb-1 hover:text-primary-500 transition-colors">
                Découvrir notre méthodologie
                <Users className="ml-2" size={18} />
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
