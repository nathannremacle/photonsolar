"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Image as ImageIcon,
  FileText,
  ShoppingBag,
  Tag,
  Newspaper,
  Building2,
  Settings,
  Plus,
  Trash2,
  Pencil,
  GripVertical,
  X,
  Save,
  Eye,
  EyeOff,
  Monitor,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { checkAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import ImageUploader from "@/components/admin/ImageUploader";
import ImageSelector from "@/components/ImageSelector";
import ProductSelector from "@/components/ProductSelector";
import ProductListSelector from "@/components/admin/ProductListSelector";
import NewsSelector from "@/components/admin/NewsSelector";
import LinkSelector from "@/components/LinkSelector";
import DatePicker from "@/components/DatePicker";
import CategorySelector from "@/components/CategorySelector";
import ColorPicker from "@/components/ColorPicker";

// Types (duplicated to avoid importing server-side code)
export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string; // Optional background image
}

export interface Promotion {
  id: number;
  badge: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string; // Optional background image
}

export interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  features: string[];
  note?: string;
  cta: string;
  ctaLink: string;
  bgColor: string;
  backgroundImage?: string; // Optional background image
}

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  date: string;
  image: string;
  link: string;
}

export interface Brand {
  name: string;
  link: string;
}

export interface HomepageContent {
  metadata?: {
    title: string;
    description: string;
    keywords: string;
  };
  banner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  };
  heroSlides: HeroSlide[];
  promotions: Promotion[];
  bestSellers: {
    enabled: boolean;
    productIds: string[];
  };
  clearance: {
    enabled: boolean;
    productIds: string[];
  };
  specialOffers: SpecialOffer[];
  news: {
    enabled: boolean;
    selectedIds: number[]; // IDs of news articles to display on homepage
  };
  brands: {
    enabled: boolean;
    items: Brand[];
  };
}

export default function AdminHomepage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push("/admin");
      return;
    }
    setAuthenticated(true);
    loadContent();
  }, [router]);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/admin/homepage");
      const data = await response.json();
      if (response.ok && data.content) {
        // Ensure metadata exists
        const loadedContent = data.content;
        if (!loadedContent.metadata) {
          loadedContent.metadata = {
            title: "Photon Solar - L'énergie solaire pour votre avenir | Belgique",
            description: "Photon Solar, expert en énergie solaire en Belgique depuis 2008.",
            keywords: "panneaux solaires, photovoltaïque, énergie solaire, Belgique",
          };
        }
        // Ensure news has selectedIds (migrate from items if needed)
        if (loadedContent.news && loadedContent.news.items && !loadedContent.news.selectedIds) {
          loadedContent.news.selectedIds = loadedContent.news.items.map((item: NewsItem) => item.id);
          delete loadedContent.news.items;
        }
        if (loadedContent.news && !loadedContent.news.selectedIds) {
          loadedContent.news.selectedIds = [];
        }
        setContent(loadedContent);
      } else {
        console.error("Failed to load homepage content");
        // Set empty content structure if API fails
        setContent({
          metadata: {
            title: "Photon Solar - L'énergie solaire pour votre avenir | Belgique",
            description: "Photon Solar, expert en énergie solaire en Belgique depuis 2008.",
            keywords: "panneaux solaires, photovoltaïque, énergie solaire, Belgique",
          },
          banner: {
            enabled: true,
            title: "",
            subtitle: "",
            ctaText: "",
            ctaLink: "",
          },
          heroSlides: [],
          promotions: [],
          bestSellers: {
            enabled: true,
            productIds: [],
          },
          clearance: {
            enabled: true,
            productIds: [],
          },
          specialOffers: [],
          news: {
            enabled: true,
            selectedIds: [],
          },
          brands: {
            enabled: true,
            items: [],
          },
        });
      }
    } catch (error) {
      console.error("Error loading content:", error);
      // Set empty content structure on error
      setContent({
        banner: {
          enabled: true,
          title: "",
          subtitle: "",
          ctaText: "",
          ctaLink: "",
        },
        heroSlides: [],
        promotions: [],
        bestSellers: {
          enabled: true,
          productIds: [],
        },
        clearance: {
          enabled: true,
          productIds: [],
        },
        specialOffers: [],
        news: {
          enabled: true,
          selectedIds: [],
        },
        brands: {
          enabled: true,
          items: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (response.ok) {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in';
        notification.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Contenu sauvegardé avec succès !</span>';
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.add('animate-slide-out');
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  // Tab navigation - no toggle needed, just set active tab

  const moveItem = <T,>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [moved] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, moved);
    return newArray;
  };

  if (!authenticated || loading || !content) {
    return (
      <AdminLayout title="Page d'accueil" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: "hero", label: "Hero Carousel", icon: ImageIcon },
    { id: "promotions", label: "Promotions", icon: Tag },
    { id: "bestsellers", label: "Meilleures ventes", icon: ShoppingBag },
    { id: "clearance", label: "Déstockage", icon: Tag },
    { id: "specialOffers", label: "Offres spéciales", icon: FileText },
    { id: "news", label: "Actualités", icon: Newspaper },
    { id: "brands", label: "Marques", icon: Building2 },
    { id: "banner", label: "Bannière", icon: Settings },
    { id: "seo", label: "SEO", icon: FileText },
  ];

  return (
    <AdminLayout
      title="Page d'accueil"
      description="Gérez tous les éléments de votre page d'accueil"
    >
      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showPreview
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="hidden sm:inline">{showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}</span>
            <span className="sm:hidden">{showPreview ? "Masquer" : "Aperçu"}</span>
          </button>
        </div>
        <button
          onClick={saveContent}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical Tabs Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-2 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`flex-1 transition-all ${showPreview ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
            {/* Hero Carousel Tab */}
            {activeTab === "hero" && (
              <HeroRepeaterEditor
                slides={content.heroSlides}
                onSlidesChange={(newSlides) => {
                  setContent({ ...content, heroSlides: newSlides });
                }}
              />
            )}

            {/* Promotions Tab */}
            {activeTab === "promotions" && (
              <PromotionsRepeaterEditor
                promotions={content.promotions}
                onPromotionsChange={(newPromos) => {
                  setContent({ ...content, promotions: newPromos });
                }}
              />
            )}

            {/* Best Sellers Tab */}
            {activeTab === "bestsellers" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Meilleures ventes</h2>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={content.bestSellers.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          bestSellers: {
                            ...content.bestSellers,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      Afficher la section
                    </span>
                  </label>
                </div>
                {content.bestSellers.enabled && (
                  <ProductListSelector
                    selectedIds={content.bestSellers.productIds}
                    onChange={(ids) =>
                      setContent({
                        ...content,
                        bestSellers: {
                          ...content.bestSellers,
                          productIds: ids,
                        },
                      })
                    }
                    label="Produits en vedette"
                  />
                )}
              </div>
            )}

            {/* Clearance Tab */}
            {activeTab === "clearance" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Déstockage</h2>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={content.clearance.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          clearance: {
                            ...content.clearance,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      Afficher la section
                    </span>
                  </label>
                </div>
                {content.clearance.enabled && (
                  <ProductListSelector
                    selectedIds={content.clearance.productIds}
                    onChange={(ids) =>
                      setContent({
                        ...content,
                        clearance: {
                          ...content.clearance,
                          productIds: ids,
                        },
                      })
                    }
                    label="Produits en déstockage"
                  />
                )}
              </div>
            )}

            {/* Special Offers Tab */}
            {activeTab === "specialOffers" && (
              <SpecialOffersRepeaterEditor
                offers={content.specialOffers}
                onOffersChange={(newOffers) => {
                  setContent({ ...content, specialOffers: newOffers });
                }}
              />
            )}

            {/* News Tab */}
            {activeTab === "news" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Actualités</h2>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={content.news.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          news: { ...content.news, enabled: e.target.checked },
                        })
                      }
                      className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                    />
                    <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                      Afficher la section
                    </span>
                  </label>
                </div>
                {content.news.enabled && (
                  <NewsSelector
                    selectedIds={content.news.selectedIds || []}
                    onChange={(ids) => {
                      setContent({
                        ...content,
                        news: { ...content.news, selectedIds: ids },
                      });
                    }}
                    label="Actualités à afficher sur la page d'accueil"
                  />
                )}
              </div>
            )}

            {/* Brands Tab */}
            {activeTab === "brands" && (
              <BrandsGridEditor
                brands={content.brands.items}
                enabled={content.brands.enabled}
                onBrandsChange={(newBrands) => {
                  setContent({
                    ...content,
                    brands: { ...content.brands, items: newBrands },
                  });
                }}
                onEnabledChange={(enabled) => {
                  setContent({
                    ...content,
                    brands: { ...content.brands, enabled },
                  });
                }}
              />
            )}

            {/* Banner Tab */}
            {activeTab === "banner" && (
              <BannerAccordionEditor
                banner={content.banner}
                onBannerChange={(newBanner) => {
                  setContent({ ...content, banner: newBanner });
                }}
              />
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <SEOAccordionEditor
                metadata={content.metadata}
                onMetadataChange={(newMetadata) => {
                  setContent({ ...content, metadata: newMetadata });
                }}
              />
            )}

          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <aside className="lg:w-1/2 bg-white rounded-xl shadow-lg border-2 border-gray-200 p-4 sm:p-6 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-orange-600" />
                Aperçu en temps réel
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Masquer l'aperçu"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <HomepagePreview content={content} />
          </aside>
        )}
      </div>
    </AdminLayout>
  );
}

// New Repeater Components with Drag & Drop

// Hero Repeater Editor with Drag & Drop
function HeroRepeaterEditor({
  slides,
  onSlidesChange,
}: {
  slides: HeroSlide[];
  onSlidesChange: (slides: HeroSlide[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(dropIndex, 0, moved);
    onSlidesChange(newSlides);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAdd = () => {
    const newId = Math.max(...slides.map((s) => s.id), 0) + 1;
    const newSlide: HeroSlide = {
      id: newId,
      badge: "Nouveau",
      title: "Nouveau slide",
      description: "Description du slide",
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-gray-500 to-gray-600",
    };
    onSlidesChange([...slides, newSlide]);
    setEditingIndex(slides.length);
  };

  const handleDelete = (index: number) => {
    if (slides.length <= 1) {
      alert("Vous devez avoir au moins un slide");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    onSlidesChange(newSlides);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleUpdate = (index: number, updated: HeroSlide) => {
    const newSlides = [...slides];
    newSlides[index] = updated;
    onSlidesChange(newSlides);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Hero Carousel</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter un slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucun slide dans le carousel</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter le premier slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingIndex === index;

            return (
              <div
                key={slide.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  bg-white rounded-xl border-2 transition-all
                  ${isDragging ? 'opacity-50 border-orange-400' : 'border-gray-200 hover:border-orange-300'}
                  ${isDragOver ? 'border-orange-500 bg-orange-50' : ''}
                `}
              >
                <div className="p-4 flex items-start gap-4">
                  <div
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    className="cursor-move mt-1 flex-shrink-0"
                  >
                    <GripVertical className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <SlideEditor
                        slide={slide}
                        onUpdate={(updated) => {
                          handleUpdate(index, updated);
                          setEditingIndex(null);
                        }}
                        onCancel={() => setEditingIndex(null)}
                      />
                    ) : (
                      <div className="flex items-start gap-4">
                        {/* Thumbnail */}
                        <div
                          className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden"
                          style={
                            slide.backgroundImage
                              ? {
                                  backgroundImage: `url(${slide.backgroundImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : undefined
                          }
                        >
                          {!slide.backgroundImage && (
                            <div className={`w-full h-full ${slide.bgColor || 'bg-gray-300'}`} />
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                  {slide.badge}
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{slide.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{slide.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingIndex(index)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Promotions Repeater Editor
function PromotionsRepeaterEditor({
  promotions,
  onPromotionsChange,
}: {
  promotions: Promotion[];
  onPromotionsChange: (promotions: Promotion[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newPromos = [...promotions];
    const [moved] = newPromos.splice(draggedIndex, 1);
    newPromos.splice(dropIndex, 0, moved);
    onPromotionsChange(newPromos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAdd = () => {
    const newId = Math.max(...promotions.map((p) => p.id), 0) + 1;
    const newPromo: Promotion = {
      id: newId,
      badge: "PROMO",
      title: "Nouvelle promotion",
      description: "Description de la promotion",
      features: [],
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
    };
    onPromotionsChange([...promotions, newPromo]);
    setEditingIndex(promotions.length);
  };

  const handleDelete = (index: number) => {
    const newPromos = promotions.filter((_, i) => i !== index);
    onPromotionsChange(newPromos);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Promotions</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter une promotion
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune promotion</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter la première promotion
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingIndex === index;

            return (
              <div
                key={promo.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  bg-white rounded-xl border-2 transition-all
                  ${isDragging ? 'opacity-50 border-orange-400' : 'border-gray-200 hover:border-orange-300'}
                  ${isDragOver ? 'border-orange-500 bg-orange-50' : ''}
                `}
              >
                <div className="p-4 flex items-start gap-4">
                  <div
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className="cursor-move mt-1 flex-shrink-0"
                  >
                    <GripVertical className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <PromotionEditor
                        promotion={promo}
                        onUpdate={(updated) => {
                          const newPromos = [...promotions];
                          newPromos[index] = updated;
                          onPromotionsChange(newPromos);
                          setEditingIndex(null);
                        }}
                        onCancel={() => setEditingIndex(null)}
                      />
                    ) : (
                      <div className="flex items-start gap-4">
                        <div
                          className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden"
                          style={
                            promo.backgroundImage
                              ? {
                                  backgroundImage: `url(${promo.backgroundImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : undefined
                          }
                        >
                          {!promo.backgroundImage && (
                            <div className={`w-full h-full ${promo.bgColor || 'bg-gray-300'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded mb-1 inline-block">
                                {promo.badge}
                              </span>
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{promo.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{promo.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingIndex(index)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Special Offers Repeater Editor
function SpecialOffersRepeaterEditor({
  offers,
  onOffersChange,
}: {
  offers: SpecialOffer[];
  onOffersChange: (offers: SpecialOffer[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newOffers = [...offers];
    const [moved] = newOffers.splice(draggedIndex, 1);
    newOffers.splice(dropIndex, 0, moved);
    onOffersChange(newOffers);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAdd = () => {
    const newId = Math.max(...offers.map((o) => o.id), 0) + 1;
    const newOffer: SpecialOffer = {
      id: newId,
      title: "Nouvelle offre spéciale",
      description: "Description de l'offre",
      features: [],
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
    };
    onOffersChange([...offers, newOffer]);
    setEditingIndex(offers.length);
  };

  const handleDelete = (index: number) => {
    const newOffers = offers.filter((_, i) => i !== index);
    onOffersChange(newOffers);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Offres spéciales</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter une offre
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune offre spéciale</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter la première offre
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingIndex === index;

            return (
              <div
                key={offer.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  bg-white rounded-xl border-2 transition-all
                  ${isDragging ? 'opacity-50 border-orange-400' : 'border-gray-200 hover:border-orange-300'}
                  ${isDragOver ? 'border-orange-500 bg-orange-50' : ''}
                `}
              >
                <div className="p-4 flex items-start gap-4">
                  <div
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className="cursor-move mt-1 flex-shrink-0"
                  >
                    <GripVertical className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <SpecialOfferEditor
                        offer={offer}
                        onUpdate={(updated) => {
                          const newOffers = [...offers];
                          newOffers[index] = updated;
                          onOffersChange(newOffers);
                          setEditingIndex(null);
                        }}
                        onCancel={() => setEditingIndex(null)}
                      />
                    ) : (
                      <div className="flex items-start gap-4">
                        <div
                          className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden"
                          style={
                            offer.backgroundImage
                              ? {
                                  backgroundImage: `url(${offer.backgroundImage})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                }
                              : undefined
                          }
                        >
                          {!offer.backgroundImage && (
                            <div className={`w-full h-full ${offer.bgColor || 'bg-gray-300'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{offer.title}</h3>
                              <p className="text-sm text-gray-600 line-clamp-2">{offer.description}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingIndex(index)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// News Repeater Editor
function NewsRepeaterEditor({
  items,
  onItemsChange,
}: {
  items: NewsItem[];
  onItemsChange: (items: NewsItem[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const newItems = [...items];
    const [moved] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, moved);
    onItemsChange(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAdd = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    const newItem: NewsItem = {
      id: newId,
      category: "Actualité",
      title: "Nouvelle actualité",
      date: new Date().toISOString().split('T')[0],
      image: "",
      link: "/",
    };
    onItemsChange([...items, newItem]);
    setEditingIndex(items.length);
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Actualités</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Ajouter une actualité
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune actualité</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter la première actualité
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingIndex === index;

            return (
              <div
                key={item.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  bg-white rounded-xl border-2 transition-all
                  ${isDragging ? 'opacity-50 border-orange-400' : 'border-gray-200 hover:border-orange-300'}
                  ${isDragOver ? 'border-orange-500 bg-orange-50' : ''}
                `}
              >
                <div className="p-4 flex items-start gap-4">
                  <div
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className="cursor-move mt-1 flex-shrink-0"
                  >
                    <GripVertical className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <NewsItemEditor
                        item={item}
                        onUpdate={(updated) => {
                          const newItems = [...items];
                          newItems[index] = updated;
                          onItemsChange(newItems);
                          setEditingIndex(null);
                        }}
                        onCancel={() => setEditingIndex(null)}
                      />
                    ) : (
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded mb-1 inline-block">
                                {item.category}
                              </span>
                              <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
                              <p className="text-xs text-gray-500">{item.date}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setEditingIndex(index)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Brands Grid Editor with Direct Upload
function BrandsGridEditor({
  brands,
  enabled,
  onBrandsChange,
  onEnabledChange,
}: {
  brands: Brand[];
  enabled: boolean;
  onBrandsChange: (brands: Brand[]) => void;
  onEnabledChange: (enabled: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const isImageUrl = (url: string): boolean => {
    if (!url) return false;
    // Check if it's a URL (http/https) or a path starting with /
    if (url.startsWith('http') || url.startsWith('/') || url.startsWith('./')) {
      return true;
    }
    // Check if it contains image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success && data.files.length > 0) {
        const newBrands = data.files.map((url: string) => ({
          name: url, // Store image URL in name field
          link: "/",
        }));
        onBrandsChange([...brands, ...newBrands]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const handleEditImageUpload = async (index: number, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', files[0]);

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success && data.files.length > 0) {
        const newBrands = [...brands];
        newBrands[index] = {
          ...newBrands[index],
          name: data.files[0],
        };
        onBrandsChange(newBrands);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (index: number) => {
    const newBrands = brands.filter((_, i) => i !== index);
    onBrandsChange(newBrands);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleUpdate = (index: number, updated: Brand) => {
    const newBrands = [...brands];
    newBrands[index] = updated;
    onBrandsChange(newBrands);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Marques</h2>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
          />
          <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
            Afficher la section
          </span>
        </label>
      </div>

      {enabled && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{brands.length} marque{brands.length > 1 ? 's' : ''}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Upload...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Ajouter des images
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>

          {brands.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aucune marque</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Ajouter des images
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {brands.map((brand, index) => {
                const isEditing = editingIndex === index;
                const brandIsImageUrl = isImageUrl(brand.name || '');
                
                return (
                  <div
                    key={index}
                    className="relative group bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all overflow-hidden"
                  >
                    {isEditing ? (
                      <div className="p-4 space-y-3">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                          {brandIsImageUrl ? (
                            <img 
                              src={brand.name} 
                              alt={`Marque ${index + 1}`} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Aucune image
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => editFileInputRefs.current[index]?.click()}
                          className="w-full px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Changer l'image
                        </button>
                        <input
                          ref={(el) => {
                            editFileInputRefs.current[index] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              handleEditImageUpload(index, e.target.files);
                            }
                          }}
                          className="hidden"
                        />
                        <input
                          type="text"
                          value={brand.link}
                          onChange={(e) => handleUpdate(index, { ...brand, link: e.target.value })}
                          placeholder="Lien (optionnel)"
                          className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="flex-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Valider
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div 
                          className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                          onClick={() => setEditingIndex(index)}
                        >
                          {brandIsImageUrl ? (
                            <img 
                              src={brand.name} 
                              alt={`Marque ${index + 1}`} 
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-sm font-medium text-gray-600">${brand.name || `Marque ${index + 1}`}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">{brand.name || `Marque ${index + 1}`}</span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIndex(index);
                            }}
                            className="p-1.5 bg-blue-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(index);
                            }}
                            className="p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Banner Accordion Editor
function BannerAccordionEditor({
  banner,
  onBannerChange,
}: {
  banner: HomepageContent['banner'];
  onBannerChange: (banner: HomepageContent['banner']) => void;
}) {
  const [isOpen, setIsOpen] = useState(banner.enabled);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bannière du haut</h2>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={banner.enabled}
            onChange={(e) => {
              onBannerChange({ ...banner, enabled: e.target.checked });
              setIsOpen(e.target.checked);
            }}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
          />
          <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
            Afficher la bannière
          </span>
        </label>
      </div>

      {banner.enabled && (
        <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                value={banner.title}
                onChange={(e) => onBannerChange({ ...banner, title: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Titre de la bannière"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
              <input
                type="text"
                value={banner.subtitle}
                onChange={(e) => onBannerChange({ ...banner, subtitle: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Sous-titre de la bannière"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
              <input
                type="text"
                value={banner.ctaText}
                onChange={(e) => onBannerChange({ ...banner, ctaText: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Ex: Voir le catalogue"
              />
            </div>
            <div>
              <LinkSelector
                value={banner.ctaLink}
                onChange={(url) => onBannerChange({ ...banner, ctaLink: url })}
                label="Lien du bouton"
              />
            </div>
          </div>
          <BannerPreview banner={banner} />
        </div>
      )}
    </div>
  );
}

// SEO Accordion Editor
function SEOAccordionEditor({
  metadata,
  onMetadataChange,
}: {
  metadata?: HomepageContent['metadata'];
  onMetadataChange: (metadata: HomepageContent['metadata']) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const currentMetadata = metadata || {
    title: "",
    description: "",
    keywords: "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Métadonnées SEO</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          {isOpen ? "Masquer" : "Afficher"}
        </button>
      </div>

      {isOpen && (
        <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre du site (SEO)</label>
            <input
              type="text"
              value={currentMetadata.title}
              onChange={(e) =>
                onMetadataChange({
                  ...currentMetadata,
                  title: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre pour les moteurs de recherche"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (SEO)</label>
            <textarea
              value={currentMetadata.description}
              onChange={(e) =>
                onMetadataChange({
                  ...currentMetadata,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Description pour les moteurs de recherche"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mots-clés (séparés par des virgules)
            </label>
            <input
              type="text"
              value={currentMetadata.keywords}
              onChange={(e) =>
                onMetadataChange({
                  ...currentMetadata,
                  keywords: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="mot-clé 1, mot-clé 2, mot-clé 3"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Preview Components
function HomepagePreview({ content }: { content: HomepageContent }) {
  return (
    <div className="space-y-8">
      {/* Banner Preview */}
      {content.banner.enabled && <BannerPreview banner={content.banner} />}

      {/* Hero Slides Preview */}
      {content.heroSlides.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Carousel Hero</h3>
          <div className="relative h-64 overflow-hidden rounded-lg">
            {content.heroSlides.slice(0, 1).map((slide) => (
              <div
                key={slide.id}
                className={`absolute inset-0 ${slide.backgroundImage ? '' : slide.bgColor} flex items-center justify-center p-6`}
                style={slide.backgroundImage ? {
                  backgroundImage: `url(${slide.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {}}
              >
                {slide.backgroundImage && (
                  <div className="absolute inset-0 bg-black/40"></div>
                )}
                <div className="text-center text-white relative z-10">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    {slide.badge}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                  <p className="text-white/90 text-sm mb-4 line-clamp-2">{slide.description}</p>
                  <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold">
                    {slide.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {content.heroSlides.length > 1 && (
            <p className="text-xs text-gray-500 mt-2">
              + {content.heroSlides.length - 1} autre(s) slide(s)
            </p>
          )}
        </div>
      )}

      {/* Promotions Preview */}
      {content.promotions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Promotions</h3>
          <div className="grid grid-cols-1 gap-4">
            {content.promotions.slice(0, 2).map((promo) => (
              <div
                key={promo.id}
                className={`${promo.backgroundImage ? '' : promo.bgColor} rounded-lg p-4 text-white relative overflow-hidden`}
                style={promo.backgroundImage ? {
                  backgroundImage: `url(${promo.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                } : {}}
              >
                {promo.backgroundImage && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
                )}
                <div className="relative z-10">
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold mb-2 uppercase">
                    {promo.badge}
                  </span>
                  <h4 className="font-bold text-sm mb-2 line-clamp-1">{promo.title}</h4>
                  <p className="text-white/90 text-xs line-clamp-2">{promo.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Preview */}
      {content.news.enabled && content.news.items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Actualités</h3>
          <div className="space-y-3">
            {content.news.items.slice(0, 2).map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                <div className="aspect-video bg-gray-200 rounded mb-2 relative overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                    {item.category}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands Preview */}
      {content.brands.enabled && content.brands.items.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Marques</h3>
          <div className="grid grid-cols-4 gap-2">
            {content.brands.items.slice(0, 8).map((brand, index) => {
              const isImageUrl = brand.name && (brand.name.startsWith('http') || brand.name.startsWith('/') || brand.name.includes('.jpg') || brand.name.includes('.png') || brand.name.includes('.jpeg') || brand.name.includes('.webp') || brand.name.includes('.svg'));
              
              return (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-2 overflow-hidden relative"
                >
                  {isImageUrl ? (
                    <img
                      src={brand.name}
                      alt={`Marque ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('span');
                          fallback.className = 'text-xs text-gray-600 text-center font-semibold';
                          fallback.textContent = brand.name || `Marque ${index + 1}`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-600 text-center font-semibold">
                      {brand.name || `Marque ${index + 1}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BannerPreview({ banner }: { banner: HomepageContent['banner'] }) {
  if (!banner.enabled) return null;
  
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Bannière</h3>
      <div className="bg-orange-600 text-white py-3 px-4 rounded-lg">
        <div className="text-center">
          <h4 className="text-sm font-bold mb-1">{banner.title}</h4>
          <p className="text-xs mb-2">{banner.subtitle}</p>
          <button className="text-xs underline">{banner.ctaText}</button>
        </div>
      </div>
    </div>
  );
}

// Section Card Component
function SectionCard({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  icon: any;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-sm">
            <Icon className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              Ouvert
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-orange-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-5 sm:p-6 border-t-2 border-gray-100 bg-gradient-to-b from-white to-gray-50/30">
          {children}
        </div>
      )}
    </div>
  );
}

// Hero Carousel Editor with Interactive Slider
function HeroCarouselEditor({
  slides,
  onSlidesChange,
}: {
  slides: HeroSlide[];
  onSlidesChange: (slides: HeroSlide[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

  const currentSlide = slides[currentIndex] || null;

  const moveItem = <T,>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [moved] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, moved);
    return newArray;
  };

  const handleUpdate = (updated: HeroSlide) => {
    const newSlides = [...slides];
    newSlides[currentIndex] = updated;
    onSlidesChange(newSlides);
  };

  const handleDelete = () => {
    if (slides.length <= 1) {
      alert("Vous devez avoir au moins un slide");
      return;
    }
    const newSlides = slides.filter((_, i) => i !== currentIndex);
    onSlidesChange(newSlides);
    if (currentIndex >= newSlides.length) {
      setCurrentIndex(Math.max(0, newSlides.length - 1));
    }
  };

  const handleAdd = () => {
    const newId = Math.max(...slides.map((s) => s.id), 0) + 1;
    const newSlide: HeroSlide = {
      id: newId,
      badge: "Nouveau",
      title: "Nouveau slide",
      description: "Description du slide",
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-gray-500 to-gray-600",
    };
    onSlidesChange([...slides, newSlide]);
    setCurrentIndex(slides.length);
  };

  const handleMove = (direction: "up" | "down") => {
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === slides.length - 1)
    )
      return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newSlides = moveItem(slides, currentIndex, newIndex);
    onSlidesChange(newSlides);
    setCurrentIndex(newIndex);
  };

  if (slides.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Aucun slide dans le carousel</p>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Ajouter le premier slide
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Carousel Navigation */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Slide Indicators & Counter */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-orange-600 shadow-sm"
                      : "w-2 bg-orange-200 hover:bg-orange-300"
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              {currentIndex + 1}/{slides.length}
            </span>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4 text-orange-600" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(slides.length - 1, currentIndex + 1))}
              disabled={currentIndex === slides.length - 1}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => handleMove("up")}
              disabled={currentIndex === 0}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Monter"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMove("down")}
              disabled={currentIndex === slides.length - 1}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Descendre"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={handleAdd}
              className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="Ajouter"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Slide Editor */}
      {currentSlide && (
        <SlideEditorCompact
          slide={currentSlide}
          onUpdate={handleUpdate}
          showPreview={showPreview}
        />
      )}
    </div>
  );
}

// Compact Slide Editor for Carousel
function SlideEditorCompact({
  slide,
  onUpdate,
  showPreview,
}: {
  slide: HeroSlide;
  onUpdate: (slide: HeroSlide) => void;
  showPreview: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Compact Preview */}
        {showPreview && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Aperçu</p>
            <div
              className={`${slide.backgroundImage ? '' : slide.bgColor} rounded-lg p-6 text-white relative overflow-hidden min-h-[160px] flex items-center justify-center`}
              style={slide.backgroundImage ? {
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {slide.backgroundImage && (
                <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
              )}
              <div className="relative z-10 text-center max-w-xl">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  {slide.badge || "Badge"}
                </span>
                <h3 className="text-lg font-bold mb-2">{slide.title || "Titre du slide"}</h3>
                <p className="text-white/90 text-sm mb-4 line-clamp-2">{slide.description || "Description du slide"}</p>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                  {slide.cta || "Bouton"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Badge <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              value={slide.badge}
              onChange={(e) => onUpdate({ ...slide, badge: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: Nouveautés..."
            />
          </div>
          <div className="md:col-span-2">
            <ImageSelector
              value={slide.backgroundImage || ""}
              onChange={(url) => onUpdate({ ...slide, backgroundImage: url })}
              label="Image de fond (optionnel)"
            />
          </div>
          <div>
            <ColorPicker
              value={slide.bgColor}
              onChange={(color) => onUpdate({ ...slide, bgColor: color })}
              label="Couleur de fond"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Titre <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdate({ ...slide, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre du slide"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Description <span className="text-orange-600">*</span>
            </label>
            <textarea
              value={slide.description}
              onChange={(e) => onUpdate({ ...slide, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
              placeholder="Description du slide"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Bouton <span className="text-orange-600">*</span>
            </label>
            <input
              type="text"
              value={slide.cta}
              onChange={(e) => onUpdate({ ...slide, cta: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: En savoir plus"
            />
          </div>
          <div>
            <LinkSelector
              value={slide.ctaLink}
              onChange={(url) => onUpdate({ ...slide, ctaLink: url })}
              label="Lien"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Slide Editor with Preview
function SlideEditor({
  slide,
  index,
  onUpdate,
  onDelete,
  onMove,
  canMoveUp,
  canMoveDown,
}: {
  slide: HeroSlide;
  index: number;
  onUpdate: (slide: HeroSlide) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-orange-300 transition-colors">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <span className="font-semibold text-gray-700">Slide {index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onMove("up")}
            disabled={!canMoveUp}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Déplacer vers le haut"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={!canMoveDown}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Déplacer vers le bas"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        {showPreview && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Aperçu :</p>
            <div
              className={`${slide.backgroundImage ? '' : slide.bgColor} rounded-lg p-6 text-white relative overflow-hidden`}
              style={slide.backgroundImage ? {
                backgroundImage: `url(${slide.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {slide.backgroundImage && (
                <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
              )}
              <div className="relative z-10">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-3">
                  {slide.badge}
                </span>
                <h3 className="text-lg font-bold mb-2">{slide.title}</h3>
                <p className="text-white/90 text-sm mb-4 line-clamp-2">{slide.description}</p>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge
            </label>
            <input
              type="text"
              value={slide.badge}
              onChange={(e) => onUpdate({ ...slide, badge: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: Nouveautés, PROMO..."
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              value={slide.backgroundImage || ""}
              onChange={(url) => onUpdate({ ...slide, backgroundImage: url })}
              label="Image de fond (optionnel - remplace la couleur si définie)"
            />
          </div>
          <div>
            <ColorPicker
              value={slide.bgColor}
              onChange={(color) => onUpdate({ ...slide, bgColor: color })}
              label="Couleur de fond (utilisée si aucune image n'est sélectionnée)"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdate({ ...slide, title: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre du slide"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={slide.description}
              onChange={(e) =>
                onUpdate({ ...slide, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
              placeholder="Description du slide"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte du bouton
            </label>
            <input
              type="text"
              value={slide.cta}
              onChange={(e) => onUpdate({ ...slide, cta: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: En savoir plus"
            />
          </div>
          <div>
            <LinkSelector
              value={slide.ctaLink}
              onChange={(url) => onUpdate({ ...slide, ctaLink: url })}
              label="Lien du bouton"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Promotions Carousel Editor
function PromotionsCarouselEditor({
  promotions,
  onPromotionsChange,
}: {
  promotions: Promotion[];
  onPromotionsChange: (promotions: Promotion[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

  const currentPromo = promotions[currentIndex] || null;

  const moveItem = <T,>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [moved] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, moved);
    return newArray;
  };

  const handleUpdate = (updated: Promotion) => {
    const newPromos = [...promotions];
    newPromos[currentIndex] = updated;
    onPromotionsChange(newPromos);
  };

  const handleDelete = () => {
    if (promotions.length <= 1) {
      const newPromos = promotions.filter((_, i) => i !== currentIndex);
      onPromotionsChange(newPromos);
      setCurrentIndex(0);
      return;
    }
    const newPromos = promotions.filter((_, i) => i !== currentIndex);
    onPromotionsChange(newPromos);
    if (currentIndex >= newPromos.length) {
      setCurrentIndex(Math.max(0, newPromos.length - 1));
    }
  };

  const handleAdd = () => {
    const newId = Math.max(...promotions.map((p) => p.id), 0) + 1;
    const newPromo: Promotion = {
      id: newId,
      badge: "PROMO",
      title: "Nouvelle promotion",
      description: "Description de la promotion",
      features: ["Feature 1", "Feature 2"],
      cta: "En savoir plus",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
    };
    onPromotionsChange([...promotions, newPromo]);
    setCurrentIndex(promotions.length);
  };

  const handleMove = (direction: "up" | "down") => {
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === promotions.length - 1)
    )
      return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newPromos = moveItem(promotions, currentIndex, newIndex);
    onPromotionsChange(newPromos);
    setCurrentIndex(newIndex);
  };

  if (promotions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4 text-sm">Aucune promotion</p>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter la première promotion
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Navigation */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-orange-600 shadow-sm"
                      : "w-2 bg-orange-200 hover:bg-orange-300"
                  }`}
                  title={`Promotion ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              {currentIndex + 1}/{promotions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4 text-orange-600" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(promotions.length - 1, currentIndex + 1))}
              disabled={currentIndex === promotions.length - 1}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => handleMove("up")}
              disabled={currentIndex === 0}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Monter"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMove("down")}
              disabled={currentIndex === promotions.length - 1}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Descendre"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={handleAdd}
              className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="Ajouter"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Promotion Editor */}
      {currentPromo && (
        <PromotionEditorCompact
          promotion={currentPromo}
          onUpdate={handleUpdate}
          showPreview={showPreview}
        />
      )}
    </div>
  );
}

// Compact Promotion Editor
function PromotionEditorCompact({
  promotion,
  onUpdate,
  showPreview,
}: {
  promotion: Promotion;
  onUpdate: (promo: Promotion) => void;
  showPreview: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {showPreview && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Aperçu</p>
            <div
              className={`${promotion.backgroundImage ? '' : promotion.bgColor} rounded-lg p-6 text-white relative overflow-hidden min-h-[160px] flex items-center justify-center`}
              style={promotion.backgroundImage ? {
                backgroundImage: `url(${promotion.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {promotion.backgroundImage && (
                <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
              )}
              <div className="relative z-10 text-center max-w-xl">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  {promotion.badge || "Badge"}
                </span>
                <h3 className="text-lg font-bold mb-2">{promotion.title || "Titre"}</h3>
                <p className="text-white/90 text-sm mb-3 line-clamp-2">{promotion.description || "Description"}</p>
                <ul className="text-xs text-white/90 mb-3 space-y-1">
                  {promotion.features.slice(0, 2).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                  {promotion.cta || "Bouton"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Badge</label>
            <input
              type="text"
              value={promotion.badge}
              onChange={(e) => onUpdate({ ...promotion, badge: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: PROMO..."
            />
          </div>
          <div className="md:col-span-2">
            <ImageSelector
              value={promotion.backgroundImage || ""}
              onChange={(url) => onUpdate({ ...promotion, backgroundImage: url })}
              label="Image de fond (optionnel)"
            />
          </div>
          <div>
            <ColorPicker
              value={promotion.bgColor}
              onChange={(color) => onUpdate({ ...promotion, bgColor: color })}
              label="Couleur de fond"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titre</label>
            <input
              type="text"
              value={promotion.title}
              onChange={(e) => onUpdate({ ...promotion, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={promotion.description}
              onChange={(e) => onUpdate({ ...promotion, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Caractéristiques (une par ligne)</label>
            <textarea
              value={promotion.features.join("\n")}
              onChange={(e) => onUpdate({ ...promotion, features: e.target.value.split("\n").filter(Boolean) })}
              rows={3}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bouton</label>
            <input
              type="text"
              value={promotion.cta}
              onChange={(e) => onUpdate({ ...promotion, cta: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <LinkSelector
              value={promotion.ctaLink}
              onChange={(url) => onUpdate({ ...promotion, ctaLink: url })}
              label="Lien"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Special Offers Carousel Editor
function SpecialOffersCarouselEditor({
  offers,
  onOffersChange,
}: {
  offers: SpecialOffer[];
  onOffersChange: (offers: SpecialOffer[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

  const currentOffer = offers[currentIndex] || null;

  const moveItem = <T,>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [moved] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, moved);
    return newArray;
  };

  const handleUpdate = (updated: SpecialOffer) => {
    const newOffers = [...offers];
    newOffers[currentIndex] = updated;
    onOffersChange(newOffers);
  };

  const handleDelete = () => {
    if (offers.length <= 1) {
      const newOffers = offers.filter((_, i) => i !== currentIndex);
      onOffersChange(newOffers);
      setCurrentIndex(0);
      return;
    }
    const newOffers = offers.filter((_, i) => i !== currentIndex);
    onOffersChange(newOffers);
    if (currentIndex >= newOffers.length) {
      setCurrentIndex(Math.max(0, newOffers.length - 1));
    }
  };

  const handleAdd = () => {
    const newId = Math.max(...offers.map((o) => o.id), 0) + 1;
    const newOffer: SpecialOffer = {
      id: newId,
      title: "Nouvelle offre",
      description: "Description de l'offre",
      features: ["Feature 1", "Feature 2"],
      cta: "Découvrir",
      ctaLink: "/",
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
    };
    onOffersChange([...offers, newOffer]);
    setCurrentIndex(offers.length);
  };

  const handleMove = (direction: "up" | "down") => {
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === offers.length - 1)
    )
      return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newOffers = moveItem(offers, currentIndex, newIndex);
    onOffersChange(newOffers);
    setCurrentIndex(newIndex);
  };

  if (offers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4 text-sm">Aucune offre spéciale</p>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter la première offre
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Navigation */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              {offers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-orange-600 shadow-sm"
                      : "w-2 bg-orange-200 hover:bg-orange-300"
                  }`}
                  title={`Offre ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              {currentIndex + 1}/{offers.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4 text-orange-600" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(offers.length - 1, currentIndex + 1))}
              disabled={currentIndex === offers.length - 1}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => handleMove("up")}
              disabled={currentIndex === 0}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Monter"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMove("down")}
              disabled={currentIndex === offers.length - 1}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Descendre"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={handleAdd}
              className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="Ajouter"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current Offer Editor */}
      {currentOffer && (
        <SpecialOfferEditorCompact
          offer={currentOffer}
          onUpdate={handleUpdate}
          showPreview={showPreview}
        />
      )}
    </div>
  );
}

// Compact Special Offer Editor
function SpecialOfferEditorCompact({
  offer,
  onUpdate,
  showPreview,
}: {
  offer: SpecialOffer;
  onUpdate: (offer: SpecialOffer) => void;
  showPreview: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {showPreview && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Aperçu</p>
            <div
              className={`${offer.backgroundImage ? '' : offer.bgColor} rounded-lg p-6 text-white relative overflow-hidden min-h-[160px] flex items-center justify-center`}
              style={offer.backgroundImage ? {
                backgroundImage: `url(${offer.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {offer.backgroundImage && (
                <div className="absolute inset-0 bg-black/30 rounded-lg"></div>
              )}
              <div className="relative z-10 text-center max-w-xl">
                <h3 className="text-lg font-bold mb-2">{offer.title || "Titre"}</h3>
                <p className="text-white/90 text-sm mb-3 line-clamp-2">{offer.description || "Description"}</p>
                <ul className="text-xs text-white/90 mb-3 space-y-1">
                  {offer.features.slice(0, 2).map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors">
                  {offer.cta || "Bouton"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <ImageSelector
              value={offer.backgroundImage || ""}
              onChange={(url) => onUpdate({ ...offer, backgroundImage: url })}
              label="Image de fond (optionnel)"
            />
          </div>
          <div>
            <ColorPicker
              value={offer.bgColor}
              onChange={(color) => onUpdate({ ...offer, bgColor: color })}
              label="Couleur de fond"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titre</label>
            <input
              type="text"
              value={offer.title}
              onChange={(e) => onUpdate({ ...offer, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              value={offer.description}
              onChange={(e) => onUpdate({ ...offer, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Caractéristiques (une par ligne)</label>
            <textarea
              value={offer.features.join("\n")}
              onChange={(e) => onUpdate({ ...offer, features: e.target.value.split("\n").filter(Boolean) })}
              rows={3}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Note (optionnel)</label>
            <input
              type="text"
              value={offer.note || ""}
              onChange={(e) => onUpdate({ ...offer, note: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bouton</label>
            <input
              type="text"
              value={offer.cta}
              onChange={(e) => onUpdate({ ...offer, cta: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="md:col-span-2">
            <LinkSelector
              value={offer.ctaLink}
              onChange={(url) => onUpdate({ ...offer, ctaLink: url })}
              label="Lien"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// News Carousel Editor
function NewsCarouselEditor({
  items,
  onItemsChange,
}: {
  items: NewsItem[];
  onItemsChange: (items: NewsItem[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);

  const currentItem = items[currentIndex] || null;

  const moveItem = <T,>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [moved] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, moved);
    return newArray;
  };

  const handleUpdate = (updated: NewsItem) => {
    const newItems = [...items];
    newItems[currentIndex] = updated;
    onItemsChange(newItems);
  };

  const handleDelete = () => {
    if (items.length <= 1) {
      const newItems = items.filter((_, i) => i !== currentIndex);
      onItemsChange(newItems);
      setCurrentIndex(0);
      return;
    }
    const newItems = items.filter((_, i) => i !== currentIndex);
    onItemsChange(newItems);
    if (currentIndex >= newItems.length) {
      setCurrentIndex(Math.max(0, newItems.length - 1));
    }
  };

  const handleAdd = () => {
    const newId = Math.max(...items.map((i) => i.id), 0) + 1;
    const newItem: NewsItem = {
      id: newId,
      category: "News",
      title: "Nouvelle actualité",
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      image: "",
      link: "/blogs/news/new-item",
    };
    onItemsChange([...items, newItem]);
    setCurrentIndex(items.length);
  };

  const handleMove = (direction: "up" | "down") => {
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === items.length - 1)
    )
      return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newItems = moveItem(items, currentIndex, newIndex);
    onItemsChange(newItems);
    setCurrentIndex(newIndex);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4 text-sm">Aucune actualité</p>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter la première actualité
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Navigation */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-orange-600 shadow-sm"
                      : "w-2 bg-orange-200 hover:bg-orange-300"
                  }`}
                  title={`Actualité ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              {currentIndex + 1}/{items.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4 text-orange-600" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
              disabled={currentIndex === items.length - 1}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => handleMove("up")}
              disabled={currentIndex === 0}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Monter"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMove("down")}
              disabled={currentIndex === items.length - 1}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Descendre"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={handleAdd}
              className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="Ajouter"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Current News Editor */}
      {currentItem && (
        <NewsItemEditorCompact
          item={currentItem}
          onUpdate={handleUpdate}
          showPreview={showPreview}
        />
      )}
    </div>
  );
}

// Compact News Item Editor
function NewsItemEditorCompact({
  item,
  onUpdate,
  showPreview,
}: {
  item: NewsItem;
  onUpdate: (item: NewsItem) => void;
  showPreview: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {showPreview && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Aperçu</p>
            <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{item.title || "Titre"}</h4>
                <p className="text-xs text-gray-500">{item.date || "Date"}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <CategorySelector
              value={item.category}
              onChange={(category) => onUpdate({ ...item, category })}
              label="Catégorie"
            />
          </div>
          <div>
            <DatePicker
              value={item.date}
              onChange={(date) => onUpdate({ ...item, date })}
              label="Date"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Titre</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre de l'actualité"
            />
          </div>
          <div className="md:col-span-2">
            <ImageSelector
              value={item.image}
              onChange={(url) => onUpdate({ ...item, image: url })}
              label="Image"
            />
          </div>
          <div className="md:col-span-2">
            <LinkSelector
              value={item.link}
              onChange={(url) => onUpdate({ ...item, link: url })}
              label="Lien"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Brands Carousel Editor
function BrandsCarouselEditor({
  brands,
  onBrandsChange,
}: {
  brands: Brand[];
  onBrandsChange: (brands: Brand[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBrand = brands[currentIndex] || null;

  const moveItem = <T,>(
    array: T[],
    fromIndex: number,
    toIndex: number
  ): T[] => {
    const newArray = [...array];
    const [moved] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, moved);
    return newArray;
  };

  const handleUpdate = (updated: Brand) => {
    const newBrands = [...brands];
    newBrands[currentIndex] = updated;
    onBrandsChange(newBrands);
  };

  const handleDelete = () => {
    if (brands.length <= 1) {
      const newBrands = brands.filter((_, i) => i !== currentIndex);
      onBrandsChange(newBrands);
      setCurrentIndex(0);
      return;
    }
    const newBrands = brands.filter((_, i) => i !== currentIndex);
    onBrandsChange(newBrands);
    if (currentIndex >= newBrands.length) {
      setCurrentIndex(Math.max(0, newBrands.length - 1));
    }
  };

  const handleAdd = () => {
    onBrandsChange([
      ...brands,
      { name: "Nouvelle marque", link: "/collections" },
    ]);
    setCurrentIndex(brands.length);
  };

  const handleMove = (direction: "up" | "down") => {
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === brands.length - 1)
    )
      return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newBrands = moveItem(brands, currentIndex, newIndex);
    onBrandsChange(newBrands);
    setCurrentIndex(newIndex);
  };

  if (brands.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4 text-sm">Aucune marque</p>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter la première marque
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Navigation */}
      <div className="bg-white rounded-xl border-2 border-orange-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              {brands.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-orange-600 shadow-sm"
                      : "w-2 bg-orange-200 hover:bg-orange-300"
                  }`}
                  title={`Marque ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
              {currentIndex + 1}/{brands.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4 text-orange-600" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(brands.length - 1, currentIndex + 1))}
              disabled={currentIndex === brands.length - 1}
              className="p-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4 text-orange-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={() => handleMove("up")}
              disabled={currentIndex === 0}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Monter"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <button
              onClick={() => handleMove("down")}
              disabled={currentIndex === brands.length - 1}
              className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Descendre"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button
              onClick={handleAdd}
              className="p-1.5 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              title="Ajouter"
            >
              <Plus className="w-4 h-4 text-green-600" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Current Brand Editor */}
      {currentBrand && (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom de la marque</label>
              <input
                type="text"
                value={currentBrand.name}
                onChange={(e) => handleUpdate({ ...currentBrand, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Ex: ELITEC, DEYE, SMA..."
              />
            </div>
            <div>
              <LinkSelector
                value={currentBrand.link}
                onChange={(url) => handleUpdate({ ...currentBrand, link: url })}
                label="Lien vers la collection"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Promotion Editor with Preview
function PromotionEditor({
  promotion,
  index,
  onUpdate,
  onDelete,
}: {
  promotion: Promotion;
  index: number;
  onUpdate: (promo: Promotion) => void;
  onDelete: () => void;
}) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-orange-300 transition-colors">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Promotion {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Preview */}
        {showPreview && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-600 mb-2">Aperçu :</p>
            <div
              className={`${promotion.backgroundImage ? '' : promotion.bgColor} rounded-lg p-6 text-white relative overflow-hidden`}
              style={promotion.backgroundImage ? {
                backgroundImage: `url(${promotion.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {promotion.backgroundImage && (
                <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
              )}
              <div className="relative z-10">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase">
                  {promotion.badge}
                </span>
                <h3 className="text-lg font-bold mb-2">{promotion.title}</h3>
                <p className="text-white/90 text-sm mb-3 line-clamp-2">{promotion.description}</p>
                <ul className="space-y-1 mb-4">
                  {promotion.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-bold mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold">
                  {promotion.cta}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge
            </label>
            <input
              type="text"
              value={promotion.badge}
              onChange={(e) =>
                onUpdate({ ...promotion, badge: e.target.value })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: PROMO, Nouveau..."
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              value={promotion.backgroundImage || ""}
              onChange={(url) => onUpdate({ ...promotion, backgroundImage: url })}
              label="Image de fond (optionnel - remplace la couleur si définie)"
            />
          </div>
          <div>
            <ColorPicker
              value={promotion.bgColor}
              onChange={(color) => onUpdate({ ...promotion, bgColor: color })}
              label="Couleur de fond (utilisée si aucune image n'est sélectionnée)"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={promotion.title}
              onChange={(e) =>
                onUpdate({ ...promotion, title: e.target.value })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre de la promotion"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={promotion.description}
              onChange={(e) =>
                onUpdate({ ...promotion, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
              placeholder="Description de la promotion"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caractéristiques (une par ligne)
            </label>
            <textarea
              value={promotion.features.join("\n")}
              onChange={(e) =>
                onUpdate({
                  ...promotion,
                  features: e.target.value.split("\n").filter(Boolean),
                })
              }
              rows={4}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
              placeholder="Caractéristique 1&#10;Caractéristique 2&#10;..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={promotion.cta}
              onChange={(e) => onUpdate({ ...promotion, cta: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <LinkSelector
              value={promotion.ctaLink}
              onChange={(url) => onUpdate({ ...promotion, ctaLink: url })}
              label="Lien du bouton"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Special Offer Editor with Preview
function SpecialOfferEditor({
  offer,
  index,
  onUpdate,
  onDelete,
}: {
  offer: SpecialOffer;
  index: number;
  onUpdate: (offer: SpecialOffer) => void;
  onDelete: () => void;
}) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-orange-300 transition-colors">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Offre {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Preview */}
        {showPreview && (
          <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Aperçu :
            </p>
            <div
              className={`${offer.backgroundImage ? '' : offer.bgColor} rounded-xl p-6 text-white relative overflow-hidden shadow-lg`}
              style={offer.backgroundImage ? {
                backgroundImage: `url(${offer.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {offer.backgroundImage && (
                <div className="absolute inset-0 bg-black/50 rounded-xl"></div>
              )}
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">{offer.title}</h3>
                <p className="text-white/90 text-sm mb-3 line-clamp-2">{offer.description}</p>
                <ul className="space-y-1 mb-3">
                  {offer.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs">
                      <span className="font-bold mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                  {offer.cta}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ImageUploader
              value={offer.backgroundImage || ""}
              onChange={(url) => onUpdate({ ...offer, backgroundImage: url })}
              label="Image de fond (optionnel - remplace la couleur si définie)"
            />
          </div>
          <div>
            <ColorPicker
              value={offer.bgColor}
              onChange={(color) => onUpdate({ ...offer, bgColor: color })}
              label="Couleur de fond (utilisée si aucune image n'est sélectionnée)"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={offer.title}
              onChange={(e) => onUpdate({ ...offer, title: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre de l'offre"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={offer.description}
              onChange={(e) => onUpdate({ ...offer, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
              placeholder="Description de l'offre"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caractéristiques (une par ligne)
            </label>
            <textarea
              value={offer.features.join("\n")}
              onChange={(e) =>
                onUpdate({
                  ...offer,
                  features: e.target.value.split("\n").filter(Boolean),
                })
              }
              rows={4}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
              placeholder="Caractéristique 1&#10;Caractéristique 2&#10;..."
            />
          </div>
          {offer.note !== undefined && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (optionnel)
              </label>
              <textarea
                value={offer.note || ""}
                onChange={(e) => onUpdate({ ...offer, note: e.target.value })}
                rows={2}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-y"
                placeholder="Note supplémentaire..."
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte du bouton
            </label>
            <input
              type="text"
              value={offer.cta}
              onChange={(e) => onUpdate({ ...offer, cta: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Ex: Découvrir"
            />
          </div>
          <div>
            <LinkSelector
              value={offer.ctaLink}
              onChange={(url) => onUpdate({ ...offer, ctaLink: url })}
              label="Lien du bouton"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// News Item Editor with Image Selector
function NewsItemEditor({
  item,
  index,
  onUpdate,
  onDelete,
}: {
  item: NewsItem;
  index: number;
  onUpdate: (item: NewsItem) => void;
  onDelete: () => void;
}) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-orange-300 transition-colors">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 flex items-center justify-between">
        <span className="font-semibold text-gray-700">Actualité {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Preview */}
        {showPreview && (
          <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Aperçu :
            </p>
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200">
              <div className="aspect-video bg-gray-200 rounded-lg mb-2 relative overflow-hidden">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-bold uppercase">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CategorySelector
              value={item.category}
              onChange={(category) => onUpdate({ ...item, category })}
              label="Catégorie"
            />
          </div>
          <div>
            <DatePicker
              value={item.date}
              onChange={(date) => onUpdate({ ...item, date })}
              label="Date"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="Titre de l'actualité"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              value={item.image}
              onChange={(url) => onUpdate({ ...item, image: url })}
              label="Image"
            />
          </div>
          <div className="md:col-span-2">
            <LinkSelector
              value={item.link}
              onChange={(url) => onUpdate({ ...item, link: url })}
              label="Lien de l'actualité"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
