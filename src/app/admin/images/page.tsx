"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Trash2,
  Search,
  Image as ImageIcon,
  X,
  Check,
  Filter,
  Package,
  Newspaper,
  Tag,
} from "lucide-react";
import { checkAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToastContext } from "@/contexts/ToastContext";

interface ImageUsageProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
}

interface ImageUsageNews {
  id: number;
  title: string;
}

interface ImageUsage {
  products: ImageUsageProduct[];
  heroSlides: number;
  promotions: number;
  specialOffers: number;
  brands: number;
  news: ImageUsageNews[];
}

interface ImageFile {
  name: string;
  path: string;
  url: string;
  size?: number;
}

type UsageFilter = "all" | "used" | "unused";
type TypeFilter = "all" | "products" | "homepage" | "news";

function isUsed(u: ImageUsage | undefined): boolean {
  if (!u) return false;
  return (
    u.products.length > 0 ||
    u.heroSlides > 0 ||
    u.promotions > 0 ||
    u.specialOffers > 0 ||
    u.brands > 0 ||
    u.news.length > 0
  );
}

function matchesType(u: ImageUsage | undefined, type: TypeFilter): boolean {
  if (!u || type === "all") return true;
  if (type === "products") return u.products.length > 0;
  if (type === "homepage")
    return u.heroSlides > 0 || u.promotions > 0 || u.specialOffers > 0 || u.brands > 0;
  if (type === "news") return u.news.length > 0;
  return true;
}

export default function AdminImages() {
  const router = useRouter();
  const toast = useToastContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [usage, setUsage] = useState<Record<string, ImageUsage>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [confirmDeletePath, setConfirmDeletePath] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [usageFilter, setUsageFilter] = useState<UsageFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [brandFilter, setBrandFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push("/admin");
      return;
    }
    setAuthenticated(true);
    loadImages();
  }, [router]);

  const loadImages = async () => {
    try {
      const response = await fetch("/api/admin/images");
      const data = await response.json();
      setImages(data.images || []);
      setUsage(data.usage || {});
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const brandsFromUsage = useMemo(() => {
    const set = new Set<string>();
    Object.values(usage).forEach((u) => u.products.forEach((p) => set.add(p.brand)));
    return Array.from(set).sort();
  }, [usage]);

  const categoriesFromUsage = useMemo(() => {
    const set = new Set<string>();
    Object.values(usage).forEach((u) => u.products.forEach((p) => set.add(p.category)));
    return Array.from(set).sort();
  }, [usage]);

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const u = usage[img.path];
      const used = isUsed(u);

      if (usageFilter === "used" && !used) return false;
      if (usageFilter === "unused" && used) return false;
      if (!matchesType(u, typeFilter)) return false;

      if (brandFilter && (!u?.products.length || !u.products.some((p) => p.brand === brandFilter)))
        return false;
      if (
        categoryFilter &&
        (!u?.products.length || !u.products.some((p) => p.category === categoryFilter))
      )
        return false;

      const term = searchTerm.toLowerCase().trim();
      if (term) {
        const matchName = img.name.toLowerCase().includes(term);
        const matchPath = img.path.toLowerCase().includes(term);
        const matchProduct =
          u?.products?.some(
            (p) =>
              p.name.toLowerCase().includes(term) ||
              p.brand.toLowerCase().includes(term) ||
              p.category.toLowerCase().includes(term)
          );
        if (!matchName && !matchPath && !matchProduct) return false;
      }
      return true;
    });
  }, [
    images,
    usage,
    searchTerm,
    usageFilter,
    typeFilter,
    brandFilter,
    categoryFilter,
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("/api/admin/images/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        loadImages();
        setShowUploadModal(false);
        const successMessage = data.message || "Images uploadées avec succès !";
        if (data.warnings?.length) {
          toast.warning(`${successMessage} Avertissements: ${data.warnings.join(" ; ")}`);
        } else {
          toast.success(successMessage);
        }
      } else {
        const err = data.error || "Erreur lors de l'upload";
        toast.error(data.details ? `${err} ${Array.isArray(data.details) ? data.details.join(" ") : data.details}` : err);
      }
    } catch (error: unknown) {
      console.error("Error uploading images:", error);
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (path: string) => setConfirmDeletePath(path);
  const handleBulkDeleteRequest = () => {
    if (selectedImages.size > 0) setConfirmBulkDelete(true);
  };

  const handleDeleteConfirm = async () => {
    const path = confirmDeletePath;
    if (!path) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/images?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      });
      setConfirmDeletePath(null);
      if (res.ok) {
        loadImages();
        toast.success("Image supprimée");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Erreur lors de la suppression");
      setConfirmDeletePath(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedImages.size === 0) return;
    const paths = Array.from(selectedImages);
    const count = paths.length;
    setDeleting(true);
    try {
      await Promise.all(
        paths.map((path) =>
          fetch(`/api/admin/images?path=${encodeURIComponent(path)}`, { method: "DELETE" })
        )
      );
      setSelectedImages(new Set());
      setConfirmBulkDelete(false);
      loadImages();
      toast.success(`${count} image(s) supprimée(s)`);
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Erreur lors de la suppression");
      setConfirmBulkDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const toggleImageSelection = (path: string) => {
    const next = new Set(selectedImages);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setSelectedImages(next);
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copiée dans le presse-papier");
  };

  if (!authenticated) return null;

  if (loading) {
    return (
      <AdminLayout title="Images" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Images"
      description={`${images.length} image${images.length > 1 ? "s" : ""} · ${filteredImages.length} affichée${filteredImages.length > 1 ? "s" : ""}`}
    >
      <div className="space-y-4">
        {/* Top bar: search, filters toggle, upload, bulk delete */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher (nom, chemin, produit, marque…)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-colors ${
                showFilters
                  ? "bg-orange-100 border-orange-300 text-orange-800"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
            {selectedImages.size > 0 && (
              <button
                type="button"
                onClick={handleBulkDeleteRequest}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer ({selectedImages.size})
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium"
            >
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline">Uploader</span>
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-3">Affiner les résultats</p>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Usage</label>
                <select
                  value={usageFilter}
                  onChange={(e) => setUsageFilter(e.target.value as UsageFilter)}
                  className="rounded-lg border border-gray-300 py-2 px-3 text-sm min-w-[140px]"
                >
                  <option value="all">Toutes</option>
                  <option value="used">Utilisées</option>
                  <option value="unused">Non utilisées</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Où</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  className="rounded-lg border border-gray-300 py-2 px-3 text-sm min-w-[140px]"
                >
                  <option value="all">Partout</option>
                  <option value="products">Produits</option>
                  <option value="homepage">Page d'accueil (hero, pubs, marques)</option>
                  <option value="news">Actualités</option>
                </select>
              </div>
              {brandsFromUsage.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Marque (produit)</label>
                  <select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-3 text-sm min-w-[140px]"
                  >
                    <option value="">Toutes</option>
                    {brandsFromUsage.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
              {categoriesFromUsage.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Catégorie (produit)</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 py-2 px-3 text-sm min-w-[140px]"
                  >
                    <option value="">Toutes</option>
                    {categoriesFromUsage.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setUsageFilter("all");
                  setTypeFilter("all");
                  setBrandFilter("");
                  setCategoryFilter("");
                  setSearchTerm("");
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {filteredImages.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {images.length === 0 ? "Aucune image dans la bibliothèque" : "Aucune image ne correspond aux filtres"}
            </p>
            {images.length === 0 ? (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Uploader votre première image
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setUsageFilter("all");
                  setTypeFilter("all");
                  setBrandFilter("");
                  setCategoryFilter("");
                }}
                className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredImages.map((image) => {
              const u = usage[image.path];
              const used = isUsed(u);
              return (
                <div
                  key={image.path}
                  className={`bg-white rounded-xl border-2 overflow-hidden transition-all cursor-pointer group relative ${
                    selectedImages.has(image.path) ? "border-orange-500 ring-2 ring-orange-200" : "border-gray-200 hover:border-orange-300"
                  }`}
                  onClick={() => toggleImageSelection(image.path)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        selectedImages.has(image.path) ? "bg-orange-600 border-orange-600" : "bg-white border-gray-300"
                      }`}
                    >
                      {selectedImages.has(image.path) && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>

                  <div className="aspect-square relative bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent)
                          parent.innerHTML =
                            '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg></div>';
                      }}
                    />
                    {/* Usage badges overlay */}
                    {used && u && (
                      <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-end max-w-[60%]">
                        {u.products.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-600/90 text-white text-[10px] font-medium" title="Produit">
                            <Package className="w-3 h-3" />
                            {u.products.length}
                          </span>
                        )}
                        {u.heroSlides > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-600/90 text-white text-[10px] font-medium" title="Hero / Slider">Hero</span>
                        )}
                        {(u.promotions > 0 || u.specialOffers > 0) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-600/90 text-white text-[10px] font-medium" title="Pub / Offre">Pub</span>
                        )}
                        {u.brands > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[10px] font-medium" title="Marque partenaire">
                            <Tag className="w-3 h-3" />
                          </span>
                        )}
                        {u.news.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-600/90 text-white text-[10px] font-medium" title="Actualité">
                            <Newspaper className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    )}
                    {!used && (
                      <div className="absolute top-2 right-2">
                        <span className="px-1.5 py-0.5 rounded bg-gray-500/80 text-white text-[10px] font-medium">Non utilisée</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyImageUrl(image.url);
                        }}
                        className="px-2 py-1.5 bg-white/95 text-gray-800 rounded-lg text-xs font-medium shadow hover:bg-gray-50"
                      >
                        Copier URL
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(image.path);
                        }}
                        className="p-1.5 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-900 truncate" title={image.name}>
                      {image.name}
                    </p>
                    {u?.products && u.products.length > 0 && (
                      <p className="text-[10px] text-gray-500 truncate mt-0.5" title={u.products.map((p) => `${p.brand} – ${p.name}`).join(", ")}>
                        {u.products.map((p) => p.brand).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Uploader des images</h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Glissez-déposez vos images ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-medium cursor-pointer hover:bg-orange-700 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {uploading ? "Upload en cours…" : "Sélectionner des images"}
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  JPG, PNG, GIF, WebP (max 10 Mo par image)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDeletePath !== null}
        title="Supprimer l'image"
        message="Voulez-vous vraiment supprimer cette image ?"
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeletePath(null)}
        loading={deleting}
      />
      <ConfirmModal
        open={confirmBulkDelete}
        title="Supprimer les images"
        message={`Voulez-vous vraiment supprimer ${selectedImages.size} image(s) ?`}
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setConfirmBulkDelete(false)}
        loading={deleting}
      />
    </AdminLayout>
  );
}
