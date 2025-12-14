"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Newspaper,
  Plus,
  Trash2,
  GripVertical,
  Save,
  FileText,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { checkAdminSession } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageSelector from '@/components/ImageSelector';
import LinkSelector from '@/components/LinkSelector';
import DatePicker from '@/components/DatePicker';
import RichTextEditor from '@/components/admin/RichTextEditor';

export interface NewsArticle {
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

export default function AdminNews() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
    loadArticles();
  }, [router]);

  const loadArticles = async () => {
    try {
      const response = await fetch('/api/admin/news');
      const data = await response.json();
      if (response.ok && data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveArticles = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles }),
      });
      if (response.ok) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in';
        notification.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Actualités sauvegardées avec succès !</span>';
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.add('animate-slide-out');
          setTimeout(() => notification.remove(), 300);
        }, 3000);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving articles:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleAdd = () => {
    const newId = Math.max(...articles.map((a) => a.id), 0) + 1;
    const title = 'Nouvelle actualité';
    const slug = generateSlug(title);
    const newArticle: NewsArticle = {
      id: newId,
      category: 'News',
      title,
      date: new Date().toISOString().split('T')[0],
      excerpt: 'Description de l\'actualité',
      slug,
      link: `/blogs/news/${slug}`,
      content: '',
      image: '',
    };
    setArticles([...articles, newArticle]);
    setEditingIndex(articles.length);
  };

  const handleDelete = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      const newArticles = articles.filter((_, i) => i !== index);
      setArticles(newArticles);
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

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
    const newArticles = [...articles];
    const [moved] = newArticles.splice(draggedIndex, 1);
    newArticles.splice(dropIndex, 0, moved);
    setArticles(newArticles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleUpdate = (index: number, updated: NewsArticle) => {
    const newArticles = [...articles];
    newArticles[index] = updated;
    setArticles(newArticles);
    setEditingIndex(null);
  };

  if (!authenticated || loading) {
    return (
      <AdminLayout title="Actualités" description="Chargement...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Actualités"
      description="Gérez les actualités de votre site"
    >
      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-orange-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestion des actualités</h2>
            <p className="text-sm text-gray-600">{articles.length} article{articles.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Ajouter une actualité
          </button>
          <button
            onClick={saveArticles}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
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
        <div className="space-y-4">
          {articles.map((article, index) => {
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingIndex === index;

            return (
              <div
                key={article.id}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  bg-white rounded-xl border-2 transition-all
                  ${isDragging ? 'opacity-50 border-orange-400' : 'border-gray-200 hover:border-orange-300'}
                  ${isDragOver ? 'border-orange-500 bg-orange-50' : ''}
                `}
              >
                <div className="p-6">
                  {isEditing ? (
                    <NewsArticleEditor
                      article={article}
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
                          {/* Thumbnail */}
                          <div className="w-32 h-24 rounded-lg flex-shrink-0 overflow-hidden bg-gray-200">
                            {article.image ? (
                              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                    {article.category}
                                  </span>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {article.date}
                                  </span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{article.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{article.excerpt}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <LinkIcon className="w-3 h-3" />
                                  <span className="truncate">{article.link}</span>
                                </div>
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}

// News Article Editor Component
function NewsArticleEditor({
  article,
  onUpdate,
  onCancel,
}: {
  article: NewsArticle;
  onUpdate: (article: NewsArticle) => void;
  onCancel: () => void;
}) {
  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const [formData, setFormData] = useState<NewsArticle>({ ...article });

  // Auto-generate slug and link when title changes
  const handleTitleChange = (title: string) => {
    const slug = generateSlug(title);
    setFormData({
      ...formData,
      title,
      slug,
      link: `/blogs/news/${slug}`,
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors select-text"
            style={{ userSelect: 'text' }}
            placeholder="News"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <DatePicker
            value={formData.date}
            onChange={(date) => setFormData({ ...formData, date })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors select-text"
          style={{ userSelect: 'text' }}
          placeholder="Titre de l'actualité"
        />
        <p className="mt-1 text-xs text-gray-500">
          URL générée automatiquement : <span className="font-mono text-orange-600">{formData.link}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Extrait</label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors select-text"
          style={{ userSelect: 'text' }}
          placeholder="Description courte de l'actualité"
        />
      </div>

      <div>
        <RichTextEditor
          value={formData.content || ''}
          onChange={(content) => setFormData({ ...formData, content })}
          label="Contenu complet de l'article"
          placeholder="Écrivez le contenu de votre article ici. Utilisez la barre d'outils pour formater le texte (gras, italique, titres, listes, etc.)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
        <ImageSelector
          value={formData.image || ''}
          onChange={(url) => setFormData({ ...formData, image: url })}
          label=""
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL de l'article (slug)</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">/blogs/news/</span>
          <input
            type="text"
            value={formData.slug || ''}
            onChange={(e) => {
              const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
              setFormData({
                ...formData,
                slug,
                link: `/blogs/news/${slug}`,
              });
            }}
            className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono text-sm"
            placeholder="slug-de-l-article"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          L'URL est générée automatiquement à partir du titre, mais vous pouvez la modifier manuellement.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}

