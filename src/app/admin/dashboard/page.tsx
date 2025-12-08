"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Image as ImageIcon,
  FileText,
  Settings,
  LogOut,
  ShoppingBag,
  Edit3,
  Upload,
  Home
} from 'lucide-react';
import { checkAdminSession, clearAdminSession } from '@/lib/admin-auth';

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    images: 0,
  });

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
    loadStats();
  }, [router]);

  const loadStats = async () => {
    try {
      const productsRes = await fetch('/api/admin/products');
      const productsData = await productsRes.json();
      setStats({
        products: productsData.products?.length || 0,
        images: 0, // TODO: implement image count
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    router.push('/admin');
  };

  if (!authenticated) {
    return null;
  }

      const menuItems = [
        {
          title: 'Gestion des Produits',
          description: 'Ajouter, modifier ou supprimer des produits',
          icon: Package,
          href: '/admin/products',
          color: 'bg-blue-500',
        },
        {
          title: 'Gestion des Images',
          description: 'Uploader, organiser et supprimer des images',
          icon: ImageIcon,
          href: '/admin/images',
          color: 'bg-green-500',
        },
        {
          title: 'Téléchargements',
          description: 'Gérer les fichiers PDF téléchargeables',
          icon: Upload,
          href: '/admin/downloads',
          color: 'bg-indigo-500',
        },
        {
          title: 'Page d\'accueil',
          description: 'Modifier tous les éléments de la page d\'accueil',
          icon: Home,
          href: '/admin/homepage',
          color: 'bg-orange-500',
        },
        {
          title: 'Contenu du Site',
          description: 'Modifier les textes et sections du site',
          icon: FileText,
          href: '/admin/content',
          color: 'bg-purple-500',
        },
        {
          title: 'Paramètres',
          description: 'Configuration générale du site',
          icon: Settings,
          href: '/admin/settings',
          color: 'bg-gray-500',
        },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Panneau d'Administration</h1>
              <p className="text-sm text-gray-600 mt-1">Gérez tout le contenu de votre site</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.products}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Images</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.images}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ImageIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actions Rapides</p>
                <p className="text-sm text-gray-900 mt-2">Accès direct</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Edit3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${item.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

