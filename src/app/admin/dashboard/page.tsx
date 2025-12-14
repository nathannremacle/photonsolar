"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Image as ImageIcon,
  ShoppingBag,
  Upload,
  Home,
  TrendingUp,
  FileText,
  Package,
  BarChart3,
  Users,
  Eye,
  ShoppingCart,
  Clock,
  Euro,
  RefreshCw,
} from 'lucide-react';
import { checkAdminSession } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    images: 0,
    downloads: 0,
    categories: 0,
    totalSize: 0,
    heroSlides: 0,
    promotions: 0,
    specialOffers: 0,
    news: 0,
    brands: 0,
    orders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!authenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      loadStats(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [authenticated, autoRefresh]);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push('/admin');
      return;
    }
    setAuthenticated(true);
    loadStats();
  }, [router]);

  const loadStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      const [productsRes, imagesRes, downloadsRes, homepageRes, ordersRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/images'),
        fetch('/api/admin/downloads').catch(() => ({ json: async () => ({ content: { categories: [] } }) })),
        fetch('/api/admin/homepage').catch(() => ({ json: async () => ({ content: {} }) })),
        fetch('/api/admin/orders').catch(() => ({ json: async () => ({ orders: [] }) })),
      ]);

      const productsData = await productsRes.json();
      const imagesData = await imagesRes.json();
      const downloadsData = await downloadsRes.json();
      const homepageData = await homepageRes.json();
      const ordersData = await ordersRes.json();

      // Count total files across all categories
      const downloadsCount = downloadsData.content?.categories?.reduce(
        (total: number, category: any) => total + (category.files?.length || 0),
        0
      ) || 0;

      // Get unique categories
      const categories = new Set(productsData.products?.map((p: any) => p.category) || []);
      
      // Calculate total image size (approximate)
      const totalSize = imagesData.images?.reduce((total: number, img: any) => {
        // Approximate size based on image count (assuming average 500KB per image)
        return total + 500;
      }, 0) || 0;

      const homepage = homepageData.content || {};
      const orders = ordersData.orders || [];

      setStats({
        products: productsData.products?.length || 0,
        images: imagesData.images?.length || 0,
        downloads: downloadsCount,
        categories: categories.size,
        totalSize: Math.round(totalSize / 1024), // Convert to MB
        heroSlides: homepage.heroSlides?.length || 0,
        promotions: homepage.promotions?.length || 0,
        specialOffers: homepage.specialOffers?.length || 0,
        news: homepage.news?.items?.length || 0,
        brands: homepage.brands?.items?.length || 0,
        orders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
        totalRevenue: orders
          .filter((o: any) => o.status === 'COMPLETED')
          .reduce((sum: number, o: any) => sum + (o.total || 0), 0),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLastRefresh(new Date());
    }
  };

  // Format time since last refresh
  const formatLastRefresh = () => {
    if (!lastRefresh) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    if (diffSeconds < 60) return `il y a ${diffSeconds}s`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    return `il y a ${diffMinutes}min`;
  };

  if (!authenticated) {
    return null;
  }


  return (
    <AdminLayout
      title="Tableau de bord"
      description="Vue d'ensemble de votre site et accès rapide aux fonctionnalités"
    >
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => loadStats()}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isRefreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          {lastRefresh && (
            <span className="text-sm text-gray-500">
              Dernière mise à jour: {formatLastRefresh()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Auto-refresh (30s)</span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoRefresh ? 'bg-orange-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoRefresh ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Produits</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Images</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.images}</p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Téléchargements</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.downloads}</p>
              )}
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Page d'accueil</p>
              <p className="text-sm text-gray-900 mt-1">Configurée</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Home className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Link href="/admin/orders" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Commandes</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.orders}</p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Link>

        <Link href="/admin/orders?filter=PENDING" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En attente</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
              )}
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Chiffre d'affaires</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-green-600">€ {stats.totalRevenue.toFixed(2)}</p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Catégories</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.categories}</p>
              )}
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Image Size */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Taille totale images</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.totalSize} MB</p>
              )}
            </div>
            <div className="bg-cyan-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>

        {/* Hero Slides */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Slides Hero</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.heroSlides}</p>
              )}
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ImageIcon className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Promotions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Promotions</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.promotions}</p>
              )}
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Special Offers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Offres spéciales</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.specialOffers}</p>
              )}
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* News */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Actualités</p>
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{stats.news}</p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

