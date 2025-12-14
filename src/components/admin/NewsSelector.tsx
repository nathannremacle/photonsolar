"use client";

import { useState, useEffect } from 'react';
import { X, Search, Check, Newspaper, Calendar, Link as LinkIcon } from 'lucide-react';

interface NewsArticle {
  id: number;
  category: string;
  title: string;
  date: string;
  excerpt: string;
  link: string;
  image?: string;
}

interface NewsSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
}

export default function NewsSelector({
  selectedIds,
  onChange,
  label = "Sélectionner des actualités",
}: NewsSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [availableNews, setAvailableNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (showModal) {
      loadNews();
    }
  }, [showModal]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/news');
      const data = await response.json();
      if (response.ok && data.articles) {
        setAvailableNews(data.articles);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNews = (newsId: number) => {
    if (selectedIds.includes(newsId)) {
      onChange(selectedIds.filter(id => id !== newsId));
    } else {
      onChange([...selectedIds, newsId]);
    }
  };

  const filteredNews = availableNews.filter(article => {
    const matchesSearch = 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const selectedNews = availableNews.filter(n => selectedIds.includes(n.id));

  // Maintain order based on selectedIds
  const orderedNews = selectedIds
    .map(id => selectedNews.find(n => n.id === id))
    .filter((n): n is NewsArticle => n !== undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Search className="w-4 h-4" />
          {selectedNews.length > 0 ? "Modifier la sélection" : "Sélectionner des actualités"}
        </button>
      </div>

      {/* Selected News List */}
      {orderedNews.length > 0 ? (
        <div className="space-y-2">
          {orderedNews.map((article) => {
            return (
              <div
                key={article.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-all"
              >
                <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                    {article.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1">{article.excerpt}</p>
                </div>
                <button
                  onClick={() => toggleNews(article.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Retirer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-center">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Aucune actualité sélectionnée</p>
          <p className="text-xs text-gray-400 mt-1">Cliquez sur "Sélectionner des actualités" pour commencer</p>
        </div>
      )}

      {/* Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Sélectionner des actualités</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedIds.length} actualité{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une actualité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* News List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Newspaper className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Aucune actualité trouvée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNews.map((article) => {
                    const isSelected = selectedIds.includes(article.id);
                    
                    return (
                      <button
                        key={article.id}
                        onClick={() => toggleNews(article.id)}
                        className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                          isSelected
                            ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-200 shadow-sm'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {article.image ? (
                              <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Newspaper className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-1 shadow-sm">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                {article.category}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {article.date}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
                              {article.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-1">{article.excerpt}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <LinkIcon className="w-3 h-3" />
                              <span className="truncate">{article.link}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600 font-medium">
                {selectedIds.length} actualité{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-sm hover:shadow-md"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

