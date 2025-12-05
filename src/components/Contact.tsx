"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Mail, Phone, MapPin, Send, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type Inputs = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(data);
    setIsSubmitting(false);
    setIsSuccess(true);
    reset();
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800 skew-x-12 translate-x-20 opacity-50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center lg:text-left mb-10">
          <span className="text-primary-500 font-semibold uppercase tracking-[0.35em] text-xs">
            CONTACTEZ-NOUS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Contact Info Side */}
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary-500 font-bold tracking-wider uppercase text-sm"
            >
              Contactez-nous
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6 leading-tight"
            >
              Prêt à passer au <br />
              <span className="text-primary-500">solaire ?</span>
            </motion.h2>
            <p className="text-white text-lg mb-10 leading-relaxed font-semibold drop-shadow">
              Discutons de votre projet. Notre équipe d'experts vous répondra sous 24h pour une étude personnalisée gratuite.
            </p>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all duration-300">
                  <Phone size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white font-extrabold uppercase tracking-wide drop-shadow-sm">Appelez-nous</p>
                  <p className="text-xl font-extrabold text-white drop-shadow">+32 (0) 42 85 92 55</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all duration-300">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white font-extrabold uppercase tracking-wide drop-shadow-sm">Envoyez un email</p>
                  <p className="text-xl font-extrabold text-white drop-shadow">info@photonsolar.be</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary-500 group-hover:border-primary-500 transition-all duration-300">
                  <MapPin size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-white font-extrabold uppercase tracking-wide drop-shadow-sm">Rendez-nous visite</p>
                  <p className="text-xl font-extrabold text-white drop-shadow">Rue du Fond du Flo 29B, Fléron</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl text-secondary-900"
          >
            <h3 className="text-2xl font-bold text-secondary-900 mb-6">Demandez votre devis</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-white mb-1">Nom complet</label>
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 font-semibold placeholder:text-gray-400"
                    placeholder="John Doe"
                  />
                  {errors.name && <span className="text-red-600 text-xs mt-1 font-bold">Requis</span>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1">Email</label>
                  <input
                    type="email"
                    {...register("email", { required: true })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-gray-900 font-semibold placeholder:text-gray-400"
                    placeholder="john@example.com"
                  />
                  {errors.email && <span className="text-red-600 text-xs mt-1 font-bold">Requis</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-1">Sujet</label>
                <select
                  {...register("subject", { required: true })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none text-gray-900 font-semibold"
                >
                  <option value="">Sélectionnez un sujet...</option>
                  <option value="devis">Nouvelle installation (Devis)</option>
                  <option value="maintenance">Entretien / Maintenance</option>
                  <option value="info">Question technique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-1">Message</label>
                <textarea
                  rows={4}
                  {...register("message", { required: true })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 font-semibold placeholder:text-gray-400"
                  placeholder="Parlez-nous de votre projet..."
                />
                {errors.message && <span className="text-red-600 text-xs mt-1 font-bold">Requis</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Envoyer la demande
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              {isSuccess && (
                <p className="text-green-600 text-center font-medium bg-green-50 p-3 rounded-lg">
                  Message envoyé avec succès !
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
