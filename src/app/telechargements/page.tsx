"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, FileText, BookOpen, FileCheck } from "lucide-react";
import Link from "next/link";
import type { DownloadsContent, DownloadCategory, DownloadFile } from "@/lib/downloads-storage";
import { safeFetchJson } from "@/utils/api";

const iconMap: Record<string, any> = {
  BookOpen,
  FileText,
  FileCheck,
  Download,
};

export default function DownloadsPage() {
  const { language } = useLanguage();
  const [content, setContent] = useState<DownloadsContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await safeFetchJson<{ content: DownloadsContent }>("/api/downloads");
      if (error) {
        console.error("Error loading downloads:", error);
        return;
      }
      if (data?.content) {
        setContent(data.content);
      }
    } catch (error) {
      console.error("Error loading downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (file: DownloadFile) => {
    // Open file in new tab for download
    window.open(file.filePath, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-600">Chargement...</div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!content) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-600">
              {language === "fr"
                ? "Aucun fichier disponible"
                : "No files available"}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "fr" ? "Téléchargements" : "Downloads"}
            </h1>
            <p className="text-gray-600 text-lg">
              {language === "fr"
                ? "Téléchargez nos catalogues, guides d'installation, fiches techniques et documents de formation"
                : "Download our catalogs, installation guides, technical sheets and training documents"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.categories.map((category) => {
              const Icon = iconMap[category.icon] || FileText;
              return (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className={`${category.color} p-6 text-white`}>
                    <div className="flex items-center gap-4 mb-2">
                      <Icon className="w-8 h-8" />
                      <h2 className="text-2xl font-bold">{category.title}</h2>
                    </div>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>

                  <div className="p-6">
                    {category.files.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">
                          {language === "fr"
                            ? "Aucun fichier disponible"
                            : "No files available"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {category.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {file.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{file.size}</span>
                                <span>•</span>
                                <span>{file.format}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(file)}
                              className="ml-4 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {language === "fr" ? "Télécharger" : "Download"}
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "fr"
                ? "Besoin d'autres documents ?"
                : "Need other documents?"}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === "fr"
                ? "Contactez-nous pour obtenir des documents supplémentaires ou des informations spécifiques"
                : "Contact us to get additional documents or specific information"}
            </p>
            <Link
              href="/contact"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              {language === "fr" ? "Nous contacter" : "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

