"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowLeft, Calendar, GraduationCap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { safeFetchJson } from "@/utils/api";

interface Formation {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  link: string;
  content: string;
  image?: string;
}

export default function FormationDetailPage() {
  const params = useParams();
  const { language } = useLanguage();
  const slug = params?.slug as string;
  const [formation, setFormation] = useState<Formation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadFormation();
  }, [slug]);

  const loadFormation = async () => {
    try {
      setLoading(true);
      const { data, error } = await safeFetchJson<{ formation: Formation }>(
        `/api/formations/${slug}`
      );
      if (error) {
        console.error("Error loading formation:", error);
        return;
      }
      if (data?.formation) setFormation(data.formation);
    } catch (error) {
      console.error("Error loading formation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
              <p className="mt-4 text-gray-600">
                {language === "fr" ? "Chargement..." : "Loading..."}
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!formation) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "fr" ? "Formation non trouvée" : "Formation not found"}
            </h1>
            <Link
              href="/formations"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === "fr" ? "Retour aux formations" : "Back to formations"}
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const isHTML =
    formation.content.trim().startsWith("<") &&
    (formation.content.includes("<p>") ||
      formation.content.includes("<h1>") ||
      formation.content.includes("<h2>") ||
      formation.content.includes("<div>"));

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "fr" ? "Retour aux formations" : "Back to formations"}
          </Link>

          <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {formation.image && (
              <div className="relative overflow-hidden bg-gray-200">
                <img
                  src={formation.image}
                  alt={formation.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-6 left-6 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg inline-flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {language === "fr" ? "Formation" : "Training"}
                </span>
              </div>
            )}

            <div className="px-8 py-10 lg:px-12 lg:py-14">
              <div className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-gray-600 text-sm mb-4">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">{formation.date}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {formation.title}
                </h1>
                {formation.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed italic">
                    {formation.excerpt}
                  </p>
                )}
              </div>

              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg">
                {formation.content ? (
                  isHTML ? (
                    <div dangerouslySetInnerHTML={{ __html: formation.content }} />
                  ) : (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                        img: ({ node, ...props }) => (
                          <img
                            {...props}
                            className="w-full h-auto rounded-xl shadow-lg my-8"
                          />
                        ),
                      }}
                    >
                      {formation.content}
                    </ReactMarkdown>
                  )
                ) : (
                  <p className="text-gray-500 italic">
                    {language === "fr"
                      ? "Aucun contenu disponible pour cette formation."
                      : "No content available for this formation."}
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}
