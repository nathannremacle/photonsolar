"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Trash2,
  GripVertical,
  Save,
  FileText,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import { checkAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmModal from "@/components/admin/ConfirmModal";
import ImageSelector from "@/components/ImageSelector";
import DatePicker from "@/components/DatePicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useToastContext } from "@/contexts/ToastContext";
import { generateFormationSlug, type Formation } from "@/lib/formation-storage";

export default function AdminFormations() {
  const router = useRouter();
  const toast = useToastContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push("/admin");
      return;
    }
    setAuthenticated(true);
    loadFormations();
  }, [router]);

  const loadFormations = async () => {
    try {
      const response = await fetch("/api/admin/formations");
      const data = await response.json();
      if (response.ok && data.formations) {
        setFormations(data.formations);
      }
    } catch (error) {
      console.error("Error loading formations:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveFormations = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formations }),
      });
      if (response.ok) {
        toast.success("Formations sauvegardées avec succès !");
        await loadFormations();
      } else {
        toast.error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Error saving formations:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const maxOrder = Math.max(...formations.map((f) => f.order), -1) + 1;
    const title = "Nouvelle formation";
    const slug = generateFormationSlug(title);
    const newFormation: Formation = {
      id: 0,
      order: maxOrder,
      title,
      date: new Date().toISOString().split("T")[0],
      excerpt: "Description de la formation",
      slug,
      link: `/formations/${slug}`,
      content: "",
      image: "",
      published: true,
    };
    setFormations([...formations, newFormation]);
    setEditingIndex(formations.length);
  };

  const handleDeleteRequest = (index: number) => setConfirmDeleteIndex(index);

  const handleDeleteConfirm = () => {
    const index = confirmDeleteIndex;
    if (index === null) return;
    setFormations(formations.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    else if (editingIndex !== null && editingIndex > index) setEditingIndex(editingIndex - 1);
    setConfirmDeleteIndex(null);
    toast.success("Formation supprimée");
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const next = [...formations];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(dropIndex, 0, moved);
    next.forEach((f, i) => {
      f.order = i;
    });
    setFormations(next);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleUpdate = (index: number, updated: Formation) => {
    const next = [...formations];
    next[index] = updated;
    setFormations(next);
    setEditingIndex(null);
  };

  if (!authenticated || loading) {
    return (
      <AdminLayout title="Formations" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Formations (Photon Académie)"
      description="Gérez les formations affichées sur /formations"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestion des formations</h2>
            <p className="text-sm text-gray-600">
              {formations.length} formation{formations.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter une formation
          </button>
          <button
            type="button"
            onClick={saveFormations}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {formations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Aucune formation</p>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            Ajouter la première formation
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formations.map((formation, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingIndex === index;

            return (
              <div
                key={formation.id || `new-${index}`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`bg-white rounded-xl border-2 transition-all ${
                  isDragging ? "opacity-50 border-orange-400" : "border-gray-200 hover:border-orange-300"
                } ${isDragOver ? "border-orange-500 bg-orange-50" : ""}`}
              >
                <div className="p-6">
                  {isEditing ? (
                    <FormationEditor
                      formation={formation}
                      onUpdate={(updated) => handleUpdate(index, updated)}
                      onCancel={() => setEditingIndex(null)}
                    />
                  ) : (
                    <div className="flex items-start gap-4">
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
                        <div className="flex items-start gap-4">
                          <div className="w-32 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                            {formation.image ? (
                              <img
                                src={formation.image}
                                alt={formation.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                    Formation
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formation.date}
                                  </span>
                                  {!formation.published && (
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                      Non publiée
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{formation.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{formation.excerpt}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <LinkIcon className="w-3 h-3" />
                                  <span className="truncate">{formation.link}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingIndex(index)}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                  title="Modifier"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRequest(index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={confirmDeleteIndex !== null}
        title="Supprimer la formation"
        message="Voulez-vous vraiment supprimer cette formation ?"
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteIndex(null)}
      />
    </AdminLayout>
  );
}

function FormationEditor({
  formation,
  onUpdate,
  onCancel,
}: {
  formation: Formation;
  onUpdate: (f: Formation) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Formation>({ ...formation });

  const handleTitleChange = (title: string) => {
    const slug = generateFormationSlug(title);
    setFormData({
      ...formData,
      title,
      slug,
      link: `/formations/${slug}`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={!!formData.published}
            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
            className="w-5 h-5 text-orange-600 border-gray-300 rounded"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">
            Publiée (visible sur le site)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Titre de la formation"
        />
        <p className="mt-1 text-xs text-gray-500">
          URL : <span className="font-mono text-orange-600">{formData.link}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Extrait</label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          placeholder="Description courte de la formation"
        />
      </div>

      <div>
        <RichTextEditor
          value={formData.content || ""}
          onChange={(content) => setFormData({ ...formData, content })}
          label="Contenu complet de la formation"
          placeholder="Contenu de la formation (texte, listes, liens…)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
        <ImageSelector
          value={formData.image || ""}
          onChange={(url) => setFormData({ ...formData, image: url })}
          label=""
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">/formations/</span>
          <input
            type="text"
            value={formData.slug || ""}
            onChange={(e) => {
              const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
              setFormData({
                ...formData,
                slug,
                link: `/formations/${slug}`,
              });
            }}
            className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-sm"
            placeholder="slug-formation"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
