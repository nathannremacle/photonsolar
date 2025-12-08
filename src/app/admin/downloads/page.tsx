"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  FileText,
  BookOpen,
  FileCheck,
  Plus,
  Trash2,
  Upload,
  Save,
  X,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { checkAdminSession } from "@/lib/admin-auth";
import type {
  DownloadsContent,
  DownloadCategory,
  DownloadFile,
} from "@/lib/downloads-storage";

const iconMap: Record<string, any> = {
  BookOpen,
  FileText,
  FileCheck,
  Download,
};

export default function AdminDownloads() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [content, setContent] = useState<DownloadsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [showUploadModal, setShowUploadModal] = useState<number | null>(null);

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
      const response = await fetch("/api/admin/downloads");
      const data = await response.json();
      if (response.ok) {
        setContent(data.content);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/downloads", {
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

  const handleFileUpload = async (
    categoryId: number,
    file: File,
    fileName: string
  ) => {
    setUploading({ ...uploading, [categoryId]: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoryId", categoryId.toString());
      formData.append("fileName", fileName);

      const response = await fetch("/api/admin/downloads/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add file to category
        const newFile: DownloadFile = {
          id: Date.now().toString(),
          name: fileName || file.name,
          size: data.file.size,
          format: "PDF",
          filePath: data.file.path,
          categoryId,
        };

        setContent((prev) => {
          if (!prev) return null;
          const newCategories = prev.categories.map((cat) =>
            cat.id === categoryId
              ? { ...cat, files: [...cat.files, newFile] }
              : cat
          );
          const newContent = { ...prev, categories: newCategories };
          
          // Auto-save after upload
          fetch("/api/admin/downloads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContent),
          }).catch(console.error);
          
          return newContent;
        });

        setShowUploadModal(null);
        alert("Fichier uploadé avec succès !");
      } else {
        alert(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Erreur lors de l'upload");
    } finally {
      setUploading({ ...uploading, [categoryId]: false });
    }
  };

  const handleDeleteFile = async (categoryId: number, file: DownloadFile) => {
    if (!confirm(`Supprimer le fichier "${file.name}" ?`)) return;

    try {
      const fileName = file.filePath.replace("/downloads/", "");
      const response = await fetch(
        `/api/admin/downloads/delete?fileName=${encodeURIComponent(fileName)}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setContent((prev) => {
          if (!prev) return null;
          const newCategories = prev.categories.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  files: cat.files.filter((f) => f.id !== file.id),
                }
              : cat
          );
          const newContent = { ...prev, categories: newCategories };
          
          // Auto-save after delete
          fetch("/api/admin/downloads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newContent),
          }).catch(console.error);
          
          return newContent;
        });
        alert("Fichier supprimé avec succès !");
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const toggleSection = (categoryId: number) => {
    setActiveSection(activeSection === categoryId ? null : categoryId);
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
                  Gestion des téléchargements
                </h1>
                <p className="text-sm text-gray-600">
                  Gérez les fichiers PDF téléchargeables
                </p>
              </div>
            </div>
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {content.categories.map((category) => {
            const Icon = iconMap[category.icon] || FileText;
            return (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`${category.color} p-2 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {category.title}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {activeSection === category.id ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {activeSection === category.id && (
                  <div className="p-6 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Files List */}
                      {category.files.length > 0 && (
                        <div className="space-y-3">
                          {category.files.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">
                                    {file.name}
                                  </h3>
                                  <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{file.size}</span>
                                    <span>•</span>
                                    <span>{file.format}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={file.filePath}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                  title="Télécharger"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => handleDeleteFile(category.id, file)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Button */}
                      <button
                        onClick={() => setShowUploadModal(category.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-500 hover:text-orange-600 transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                        Ajouter un fichier PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Uploader un fichier PDF
              </h2>
              <button
                onClick={() => setShowUploadModal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <UploadForm
              categoryId={showUploadModal}
              onUpload={handleFileUpload}
              onCancel={() => setShowUploadModal(null)}
              uploading={uploading[showUploadModal] || false}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function UploadForm({
  categoryId,
  onUpload,
  onCancel,
  uploading,
}: {
  categoryId: number;
  onUpload: (categoryId: number, file: File, fileName: string) => void;
  onCancel: () => void;
  uploading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      const finalFileName = fileName.trim() || file.name.replace(/\.pdf$/i, "");
      onUpload(categoryId, file, finalFileName);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fichier PDF
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
              setFile(selectedFile);
              if (!fileName) {
                setFileName(selectedFile.name.replace(/\.pdf$/i, ""));
              }
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom du fichier (sans extension)
        </label>
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Nom du fichier"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Le fichier sera sauvegardé sous : {fileName || "..."}.pdf
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!file || uploading}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {uploading ? "Upload..." : "Uploader"}
        </button>
      </div>
    </form>
  );
}

