"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft,
  Edit3,
  FileText,
  Image as ImageIcon,
  Plus,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { checkAdminSession } from '@/lib/admin-auth';

interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
}

interface Promotion {
  id: number;
  badge: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  bgColor: string;
}

interface SiteContent {
  hero: {
    banner: {
      title: string;
      subtitle: string;
      ctaText: string;
      ctaLink: string;
    };
    slides: HeroSlide[];
  };
  promotions: Promotion[];
  metadata: {
    title: string;
    description: string;
    keywords: string;
  };
}

export default function AdminContent() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['hero', 'promotions', 'metadata']));
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editingPromo, setEditingPromo] = useState<number | null>(null);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
    loadContent();
  }, [router]);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/admin/content');
      const data = await response.json();
      setContent(data.content || getDefaultContent());
    } catch (error) {
      console.error('Error loading content:', error);
      setContent(getDefaultContent());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultContent = (): SiteContent => ({
    hero: {
      banner: {
        title: "Bienvenue chez Photon Solar",
        subtitle: "Votre spécialiste en énergie solaire depuis 2008",
        ctaText: "Voir le catalogue",
        ctaLink: "/collections",
      },
      slides: [
        {
          id: 1,
          badge: "Depuis 2008",
          title: "Pourquoi PhotonSolar ?",
          description: "Depuis 2008, PhotonSolar s'impose comme un acteur incontournable dans le domaine de l'énergie solaire.",
          cta: "En savoir plus",
          ctaLink: "/pages/a-propos",
          bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
        },
      ],
    },
    promotions: [],
    metadata: {
      title: "Photon Solar - L'énergie solaire pour votre avenir | Belgique",
      description: "Photon Solar, expert en énergie solaire en Belgique depuis 2008.",
      keywords: "panneaux solaires, photovoltaïque, énergie solaire, Belgique",
    },
  });

  const handleSave = async () => {
    if (!content) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        alert('Contenu sauvegardé avec succès!');
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const addHeroSlide = () => {
    if (!content) return;
    const newSlide: HeroSlide = {
      id: Date.now(),
      badge: "Nouveau",
      title: "Nouveau slide",
      description: "Description du slide",
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    };
    setContent({
      ...content,
      hero: {
        ...content.hero,
        slides: [...content.hero.slides, newSlide],
      },
    });
  };

  const removeHeroSlide = (id: number) => {
    if (!content) return;
    setContent({
      ...content,
      hero: {
        ...content.hero,
        slides: content.hero.slides.filter(s => s.id !== id),
      },
    });
  };

  const addPromotion = () => {
    if (!content) return;
    const newPromo: Promotion = {
      id: Date.now(),
      badge: "PROMO",
      title: "Nouvelle promotion",
      description: "Description de la promotion",
      features: ["Caractéristique 1", "Caractéristique 2"],
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
    };
    setContent({
      ...content,
      promotions: [...content.promotions, newPromo],
    });
  };

  const removePromotion = (id: number) => {
    if (!content) return;
    setContent({
      ...content,
      promotions: content.promotions.filter(p => p.id !== id),
    });
  };

  const updateField = (path: string[], value: any) => {
    if (!content) return;
    const newContent = { ...content };
    let current: any = newContent;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setContent(newContent);
  };

  if (!authenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion du Contenu</h1>
                <p className="text-sm text-gray-600 mt-1">Modifiez les textes et sections du site</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metadata */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('metadata')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Métadonnées du site</h2>
            </div>
            {expandedSections.has('metadata') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSections.has('metadata') && (
            <div className="px-6 py-4 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du site
                </label>
                <input
                  type="text"
                  value={content.metadata.title}
                  onChange={(e) => updateField(['metadata', 'title'], e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={content.metadata.description}
                  onChange={(e) => updateField(['metadata', 'description'], e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mots-clés
                </label>
                <input
                  type="text"
                  value={content.metadata.keywords}
                  onChange={(e) => updateField(['metadata', 'keywords'], e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="mot-clé 1, mot-clé 2, mot-clé 3"
                />
              </div>
            </div>
          )}
        </div>

        {/* Hero Banner */}
        <div className="bg-white rounded-lg shadow">
          <button
            onClick={() => toggleSection('hero-banner')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <ImageIcon className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Bannière Hero</h2>
            </div>
            {expandedSections.has('hero-banner') ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSections.has('hero-banner') && (
            <div className="px-6 py-4 border-t space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={content.hero.banner.title}
                    onChange={(e) => updateField(['hero', 'banner', 'title'], e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={content.hero.banner.subtitle}
                    onChange={(e) => updateField(['hero', 'banner', 'subtitle'], e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte du bouton
                  </label>
                  <input
                    type="text"
                    value={content.hero.banner.ctaText}
                    onChange={(e) => updateField(['hero', 'banner', 'ctaText'], e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien du bouton
                  </label>
                  <input
                    type="text"
                    value={content.hero.banner.ctaLink}
                    onChange={(e) => updateField(['hero', 'banner', 'ctaLink'], e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero Slides */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Slides Hero ({content.hero.slides.length})</h2>
            </div>
            <button
              onClick={addHeroSlide}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter un slide
            </button>
          </div>
          <div className="divide-y">
            {content.hero.slides.map((slide, index) => (
              <div key={slide.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Slide {index + 1}</h3>
                  <button
                    onClick={() => removeHeroSlide(slide.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge
                    </label>
                    <input
                      type="text"
                      value={slide.badge}
                      onChange={(e) => {
                        const newSlides = [...content.hero.slides];
                        newSlides[index].badge = e.target.value;
                        updateField(['hero', 'slides'], newSlides);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de fond (classe Tailwind)
                    </label>
                    <input
                      type="text"
                      value={slide.bgColor}
                      onChange={(e) => {
                        const newSlides = [...content.hero.slides];
                        newSlides[index].bgColor = e.target.value;
                        updateField(['hero', 'slides'], newSlides);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="bg-gradient-to-br from-blue-500 to-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => {
                      const newSlides = [...content.hero.slides];
                      newSlides[index].title = e.target.value;
                      updateField(['hero', 'slides'], newSlides);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => {
                      const newSlides = [...content.hero.slides];
                      newSlides[index].description = e.target.value;
                      updateField(['hero', 'slides'], newSlides);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={slide.cta}
                      onChange={(e) => {
                        const newSlides = [...content.hero.slides];
                        newSlides[index].cta = e.target.value;
                        updateField(['hero', 'slides'], newSlides);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien du bouton
                    </label>
                    <input
                      type="text"
                      value={slide.ctaLink}
                      onChange={(e) => {
                        const newSlides = [...content.hero.slides];
                        newSlides[index].ctaLink = e.target.value;
                        updateField(['hero', 'slides'], newSlides);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Promotions ({content.promotions.length})</h2>
            </div>
            <button
              onClick={addPromotion}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter une promotion
            </button>
          </div>
          <div className="divide-y">
            {content.promotions.map((promo, index) => (
              <div key={promo.id} className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Promotion {index + 1}</h3>
                  <button
                    onClick={() => removePromotion(promo.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge
                    </label>
                    <input
                      type="text"
                      value={promo.badge}
                      onChange={(e) => {
                        const newPromos = [...content.promotions];
                        newPromos[index].badge = e.target.value;
                        updateField(['promotions'], newPromos);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur de fond
                    </label>
                    <input
                      type="text"
                      value={promo.bgColor}
                      onChange={(e) => {
                        const newPromos = [...content.promotions];
                        newPromos[index].bgColor = e.target.value;
                        updateField(['promotions'], newPromos);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={promo.title}
                    onChange={(e) => {
                      const newPromos = [...content.promotions];
                      newPromos[index].title = e.target.value;
                      updateField(['promotions'], newPromos);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={promo.description}
                    onChange={(e) => {
                      const newPromos = [...content.promotions];
                      newPromos[index].description = e.target.value;
                      updateField(['promotions'], newPromos);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caractéristiques (une par ligne)
                  </label>
                  <textarea
                    value={promo.features.join('\n')}
                    onChange={(e) => {
                      const newPromos = [...content.promotions];
                      newPromos[index].features = e.target.value.split('\n').filter(Boolean);
                      updateField(['promotions'], newPromos);
                    }}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={promo.cta}
                      onChange={(e) => {
                        const newPromos = [...content.promotions];
                        newPromos[index].cta = e.target.value;
                        updateField(['promotions'], newPromos);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien du bouton
                    </label>
                    <input
                      type="text"
                      value={promo.ctaLink}
                      onChange={(e) => {
                        const newPromos = [...content.promotions];
                        newPromos[index].ctaLink = e.target.value;
                        updateField(['promotions'], newPromos);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

