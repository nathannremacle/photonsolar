"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { safeFetchJson } from "@/utils/api";

interface NewsArticle {
  id: number;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  slug: string;
  link: string;
  content: string;
  image?: string;
}

export default function NewsArticlePage() {
  const params = useParams();
  const { language } = useLanguage();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await safeFetchJson<{ article: NewsArticle }>(`/api/news/${slug}`);
      if (error) {
        console.error('Error loading article:', error);
        return;
      }
      if (data?.article) {
        setArticle(data.article);
      }
    } catch (error) {
      console.error('Error loading article:', error);
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
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "fr" ? "Article non trouvé" : "Article not found"}
            </h1>
            <Link
              href="/blogs/news"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === "fr" ? "Retour aux actualités" : "Back to news"}
            </Link>
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
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs/news"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "fr" ? "Retour aux actualités" : "Back to news"}
          </Link>

          <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Article Image */}
            {article.image && (
              <div className="relative overflow-hidden bg-gray-200">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute top-6 left-6 bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                  {article.category}
                </span>
              </div>
            )}
            
            <div className="px-8 py-10 lg:px-12 lg:py-14">
              {/* Article Header */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-gray-600 text-sm mb-4">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="font-medium">{article.date}</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="text-xl text-gray-600 leading-relaxed italic">
                    {article.excerpt}
                  </p>
                )}
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:marker:text-primary prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-p:mb-6 prose-p:leading-relaxed prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-ul:my-6 prose-ol:my-6 prose-li:my-1 prose-li:leading-relaxed">
                {article.content ? (
                  (() => {
                    // Detect if content is HTML (starts with <) or Markdown
                    const isHTML = article.content.trim().startsWith('<') && 
                                   (article.content.includes('<p>') || 
                                    article.content.includes('<h1>') || 
                                    article.content.includes('<h2>') || 
                                    article.content.includes('<div>') ||
                                    article.content.includes('<ul>') ||
                                    article.content.includes('<ol>'));
                    
                    if (isHTML) {
                      // Render HTML content
                      return (
                        <div 
                          dangerouslySetInnerHTML={{ __html: article.content }} 
                        />
                      );
                    } else {
                      // Render Markdown content
                      return (
                        <ReactMarkdown
                          components={{
                            // Custom link component to open in new tab
                            a: ({ node, ...props }) => (
                              <a {...props} target="_blank" rel="noopener noreferrer" />
                            ),
                            // Custom image component
                            img: ({ node, ...props }) => (
                              <img {...props} className="w-full h-auto rounded-xl shadow-lg my-8" />
                            ),
                          }}
                        >
                          {article.content}
                        </ReactMarkdown>
                      );
                    }
                  })()
                ) : (
                  <p className="text-gray-500 italic">Aucun contenu disponible pour cet article.</p>
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

