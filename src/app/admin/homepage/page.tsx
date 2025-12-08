"use client";

import { useEffect, useState } from "react";
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
  GripVertical,
  X,
  Save,
  Eye,
  EyeOff,
  Monitor,
  ChevronUp,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { checkAdminSession } from "@/lib/admin-auth";
import ImageSelector from "@/components/ImageSelector";
import ProductSelector from "@/components/ProductSelector";
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
    items: NewsItem[];
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
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
        setContent(data.content);
      } else {
        console.error("Failed to load homepage content");
        // Set empty content structure if API fails
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
            items: [],
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
          items: [],
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
        alert("Contenu sauvegardé avec succès !");
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

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion de la page d'accueil
                </h1>
                <p className="text-sm text-gray-600">
                  Modifiez tous les éléments de votre page d'accueil
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Monitor className="w-4 h-4" />
                {showPreview ? "Masquer l'aperçu" : "Aperçu"}
              </button>
              <button
                onClick={saveContent}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <main className={`flex-1 transition-all ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <div className="space-y-6">
            {/* Banner Section */}
            <SectionCard
              title="Bannière du haut"
              icon={Settings}
              isExpanded={activeSection === "banner"}
              onToggle={() => toggleSection("banner")}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.banner.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          banner: { ...content.banner, enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span>Afficher la bannière</span>
                  </label>
                </div>
                {content.banner.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={content.banner.title}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              banner: { ...content.banner, title: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sous-titre
                        </label>
                        <input
                          type="text"
                          value={content.banner.subtitle}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              banner: {
                                ...content.banner,
                                subtitle: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texte du bouton
                        </label>
                        <input
                          type="text"
                          value={content.banner.ctaText}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              banner: { ...content.banner, ctaText: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <LinkSelector
                          value={content.banner.ctaLink}
                          onChange={(url) =>
                            setContent({
                              ...content,
                              banner: { ...content.banner, ctaLink: url },
                            })
                          }
                          label="Lien du bouton"
                        />
                      </div>
                    </div>
                    {/* Preview */}
                    <BannerPreview banner={content.banner} />
                  </>
                )}
              </div>
            </SectionCard>

            {/* Hero Slides */}
            <SectionCard
              title="Carousel Hero"
              icon={ImageIcon}
              isExpanded={activeSection === "hero"}
              onToggle={() => toggleSection("hero")}
            >
              <div className="space-y-4">
                {content.heroSlides.map((slide, index) => (
                  <SlideEditor
                    key={slide.id}
                    slide={slide}
                    index={index}
                    onUpdate={(updated) => {
                      const newSlides = [...content.heroSlides];
                      newSlides[index] = updated;
                      setContent({ ...content, heroSlides: newSlides });
                    }}
                    onDelete={() => {
                      const newSlides = content.heroSlides.filter(
                        (s) => s.id !== slide.id
                      );
                      setContent({ ...content, heroSlides: newSlides });
                    }}
                    onMove={(direction) => {
                      if (
                        (direction === "up" && index === 0) ||
                        (direction === "down" && index === content.heroSlides.length - 1)
                      )
                        return;
                      const newIndex =
                        direction === "up" ? index - 1 : index + 1;
                      const newSlides = moveItem(content.heroSlides, index, newIndex);
                      setContent({ ...content, heroSlides: newSlides });
                    }}
                    canMoveUp={index > 0}
                    canMoveDown={index < content.heroSlides.length - 1}
                  />
                ))}
                <button
                  onClick={() => {
                    const newId =
                      Math.max(...content.heroSlides.map((s) => s.id)) + 1;
                    const newSlide: HeroSlide = {
                      id: newId,
                      badge: "Nouveau",
                      title: "Nouveau slide",
                      description: "Description du slide",
                      cta: "En savoir plus",
                      ctaLink: "/",
                      bgColor: "bg-gradient-to-br from-gray-500 to-gray-600",
                    };
                    setContent({
                      ...content,
                      heroSlides: [...content.heroSlides, newSlide],
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un slide
                </button>
              </div>
            </SectionCard>

            {/* Promotions */}
            <SectionCard
              title="Promotions"
              icon={Tag}
              isExpanded={activeSection === "promotions"}
              onToggle={() => toggleSection("promotions")}
            >
              <div className="space-y-4">
                {content.promotions.map((promo, index) => (
                  <PromotionEditor
                    key={promo.id}
                    promotion={promo}
                    index={index}
                    onUpdate={(updated) => {
                      const newPromos = [...content.promotions];
                      newPromos[index] = updated;
                      setContent({ ...content, promotions: newPromos });
                    }}
                    onDelete={() => {
                      const newPromos = content.promotions.filter(
                        (p) => p.id !== promo.id
                      );
                      setContent({ ...content, promotions: newPromos });
                    }}
                  />
                ))}
                <button
                  onClick={() => {
                    const newId =
                      Math.max(...content.promotions.map((p) => p.id)) + 1;
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
                    setContent({
                      ...content,
                      promotions: [...content.promotions, newPromo],
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une promotion
                </button>
              </div>
            </SectionCard>

            {/* Best Sellers */}
            <SectionCard
              title="Meilleures ventes"
              icon={ShoppingBag}
              isExpanded={activeSection === "bestsellers"}
              onToggle={() => toggleSection("bestsellers")}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
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
                      className="w-4 h-4"
                    />
                    <span>Afficher la section</span>
                  </label>
                </div>
                {content.bestSellers.enabled && (
                  <ProductSelector
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
            </SectionCard>

            {/* Clearance */}
            <SectionCard
              title="Déstockage"
              icon={Tag}
              isExpanded={activeSection === "clearance"}
              onToggle={() => toggleSection("clearance")}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
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
                      className="w-4 h-4"
                    />
                    <span>Afficher la section</span>
                  </label>
                </div>
                {content.clearance.enabled && (
                  <ProductSelector
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
            </SectionCard>

            {/* Special Offers */}
            <SectionCard
              title="Offres spéciales"
              icon={FileText}
              isExpanded={activeSection === "specialOffers"}
              onToggle={() => toggleSection("specialOffers")}
            >
              <div className="space-y-4">
                {content.specialOffers.map((offer, index) => (
                  <SpecialOfferEditor
                    key={offer.id}
                    offer={offer}
                    index={index}
                    onUpdate={(updated) => {
                      const newOffers = [...content.specialOffers];
                      newOffers[index] = updated;
                      setContent({ ...content, specialOffers: newOffers });
                    }}
                    onDelete={() => {
                      const newOffers = content.specialOffers.filter(
                        (o) => o.id !== offer.id
                      );
                      setContent({ ...content, specialOffers: newOffers });
                    }}
                  />
                ))}
                <button
                  onClick={() => {
                    const newId =
                      Math.max(...content.specialOffers.map((o) => o.id)) + 1;
                    const newOffer: SpecialOffer = {
                      id: newId,
                      title: "Nouvelle offre",
                      description: "Description de l'offre",
                      features: ["Feature 1", "Feature 2"],
                      cta: "Découvrir",
                      ctaLink: "/",
                      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
                    };
                    setContent({
                      ...content,
                      specialOffers: [...content.specialOffers, newOffer],
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter une offre spéciale
                </button>
              </div>
            </SectionCard>

            {/* News */}
            <SectionCard
              title="Actualités"
              icon={Newspaper}
              isExpanded={activeSection === "news"}
              onToggle={() => toggleSection("news")}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.news.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          news: { ...content.news, enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span>Afficher la section</span>
                  </label>
                </div>
                {content.news.enabled && (
                  <div className="space-y-4">
                    {content.news.items.map((item, index) => (
                      <NewsItemEditor
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdate={(updated) => {
                          const newItems = [...content.news.items];
                          newItems[index] = updated;
                          setContent({
                            ...content,
                            news: { ...content.news, items: newItems },
                          });
                        }}
                        onDelete={() => {
                          const newItems = content.news.items.filter(
                            (i) => i.id !== item.id
                          );
                          setContent({
                            ...content,
                            news: { ...content.news, items: newItems },
                          });
                        }}
                      />
                    ))}
                    <button
                      onClick={() => {
                        const newId =
                          Math.max(...content.news.items.map((i) => i.id)) + 1;
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
                        setContent({
                          ...content,
                          news: {
                            ...content.news,
                            items: [...content.news.items, newItem],
                          },
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter une actualité
                    </button>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Brands */}
            <SectionCard
              title="Marques"
              icon={Building2}
              isExpanded={activeSection === "brands"}
              onToggle={() => toggleSection("brands")}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={content.brands.enabled}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          brands: { ...content.brands, enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span>Afficher la section</span>
                  </label>
                </div>
                {content.brands.enabled && (
                  <div className="space-y-3">
                    {content.brands.items.map((brand, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="w-5 h-5 text-gray-400 mt-2" />
                          <div className="flex-1 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom de la marque
                              </label>
                              <input
                                type="text"
                                value={brand.name}
                                onChange={(e) => {
                                  const newBrands = [...content.brands.items];
                                  newBrands[index] = { ...brand, name: e.target.value };
                                  setContent({
                                    ...content,
                                    brands: { ...content.brands, items: newBrands },
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="Ex: ELITEC, DEYE, SMA..."
                              />
                            </div>
                            <div>
                              <LinkSelector
                                value={brand.link}
                                onChange={(url) => {
                                  const newBrands = [...content.brands.items];
                                  newBrands[index] = { ...brand, link: url };
                                  setContent({
                                    ...content,
                                    brands: { ...content.brands, items: newBrands },
                                  });
                                }}
                                label="Lien vers la collection"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const newBrands = content.brands.items.filter(
                                (_, i) => i !== index
                              );
                              setContent({
                                ...content,
                                brands: { ...content.brands, items: newBrands },
                              });
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setContent({
                          ...content,
                          brands: {
                            ...content.brands,
                            items: [
                              ...content.brands.items,
                              { name: "Nouvelle marque", link: "/collections" },
                            ],
                          },
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter une marque
                    </button>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </main>

        {/* Preview Panel */}
        {showPreview && (
          <aside className="w-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Aperçu en temps réel
            </h2>
            <HomepagePreview content={content} />
          </aside>
        )}
      </div>
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
            {content.brands.items.slice(0, 8).map((brand, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-2"
              >
                <span className="text-xs text-gray-600 text-center font-semibold">
                  {brand.name}
                </span>
              </div>
            ))}
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">{children}</div>
      )}
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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">Slide {index + 1}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-600 hover:text-gray-900"
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            <Eye className={`w-4 h-4 ${showPreview ? '' : 'opacity-50'}`} />
          </button>
          <button
            onClick={() => onMove("up")}
            disabled={!canMoveUp}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={!canMoveDown}
            className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge
            </label>
            <input
              type="text"
              value={slide.badge}
              onChange={(e) => onUpdate({ ...slide, badge: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <ImageSelector
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdate({ ...slide, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={slide.description}
              onChange={(e) =>
                onUpdate({ ...slide, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={slide.cta}
              onChange={(e) => onUpdate({ ...slide, cta: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 flex items-center justify-between">
        <span className="font-medium text-gray-700">Promotion {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <Eye className={`w-4 h-4 ${showPreview ? '' : 'opacity-50'}`} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge
            </label>
            <input
              type="text"
              value={promotion.badge}
              onChange={(e) =>
                onUpdate({ ...promotion, badge: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <ImageSelector
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={promotion.title}
              onChange={(e) =>
                onUpdate({ ...promotion, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={promotion.description}
              onChange={(e) =>
                onUpdate({ ...promotion, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 flex items-center justify-between">
        <span className="font-medium text-gray-700">Offre {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <Eye className={`w-4 h-4 ${showPreview ? '' : 'opacity-50'}`} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
              className={`${offer.backgroundImage ? '' : offer.bgColor} rounded-lg p-6 text-white relative overflow-hidden`}
              style={offer.backgroundImage ? {
                backgroundImage: `url(${offer.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : {}}
            >
              {offer.backgroundImage && (
                <div className="absolute inset-0 bg-black/50 rounded-lg"></div>
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
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold">
                  {offer.cta}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ImageSelector
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={offer.title}
              onChange={(e) => onUpdate({ ...offer, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={offer.description}
              onChange={(e) => onUpdate({ ...offer, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {offer.note !== undefined && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optionnel)
              </label>
              <textarea
                value={offer.note || ""}
                onChange={(e) => onUpdate({ ...offer, note: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bouton
            </label>
            <input
              type="text"
              value={offer.cta}
              onChange={(e) => onUpdate({ ...offer, cta: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 flex items-center justify-between">
        <span className="font-medium text-gray-700">Actualité {index + 1}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-1 text-gray-600 hover:text-gray-900"
          >
            <Eye className={`w-4 h-4 ${showPreview ? '' : 'opacity-50'}`} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
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
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              label="Lien de l'actualité"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
