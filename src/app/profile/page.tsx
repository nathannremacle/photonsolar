"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer, useToast } from "@/components/Toast";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Euro, 
  ShoppingBag,
  ArrowLeft,
  LogOut,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { safeFetchJson } from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    brand: string;
    image?: string;
  } | null;
}

interface Order {
  id: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  companyName: string | null;
  createdAt: string;
  emailVerified: string | null;
  image: string | null;
}

interface ProfileStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { toasts, success, error, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "orders">("info");

  // Check for new order success
  useEffect(() => {
    const orderId = searchParams.get("order");
    if (orderId) {
      success("Commande validée avec succès ! Vous pouvez suivre son statut ci-dessous.", 5000);
      setActiveTab("orders");
      // Clean URL
      router.replace("/profile");
    }
  }, [searchParams, success, router]);

  // Load profile data
  useEffect(() => {
    if (status === "authenticated") {
      loadProfile();
    }
  }, [status]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await safeFetchJson<{
        success: boolean;
        user: UserProfile;
        orders: Order[];
        stats: ProfileStats;
      }>("/api/user/profile");

      if (fetchError || !data?.success) {
        console.error("Profile load error:", fetchError);
        error("Erreur lors du chargement du profil");
        return;
      }

      setProfile(data.user);
      setOrders(data.orders);
      setStats(data.stats);
    } catch (err) {
      console.error("Profile load error:", err);
      error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Terminée";
      case "CANCELLED":
        return "Annulée";
      default:
        return "En cours";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du profil...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>Retour à l'accueil</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
                <p className="text-gray-600 mt-2">Gérez vos informations et suivez vos commandes</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-500">Commandes</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
                    <p className="text-xs text-gray-500">En cours</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
                    <p className="text-xs text-gray-500">Terminées</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Euro className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">€{stats.totalSpent.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Total dépensé</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "info"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <User size={18} />
                Informations
              </span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "orders"
                  ? "bg-orange-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <Package size={18} />
                Mes commandes
                {stats && stats.pendingOrders > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.pendingOrders}
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {profile?.image ? (
                          <Image
                            src={profile.image}
                            alt={profile?.name || "User"}
                            width={96}
                            height={96}
                            className="rounded-full border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-orange-600 text-3xl font-bold shadow-lg">
                            {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                      <div className="text-white">
                        <h2 className="text-2xl font-bold">
                          {profile?.name || "Utilisateur"}
                        </h2>
                        <p className="opacity-90">{profile?.email}</p>
                        {profile?.companyName && (
                          <p className="opacity-80 text-sm mt-1">{profile.companyName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {profile?.emailVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                              <CheckCircle2 size={12} />
                              Email vérifié
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400/30 text-white text-xs font-semibold rounded-full">
                              <Clock size={12} />
                              Email non vérifié
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nom complet</p>
                          <p className="font-semibold text-gray-900">{profile?.name || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{profile?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-semibold text-gray-900">{profile?.phoneNumber || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Entreprise</p>
                          <p className="font-semibold text-gray-900">{profile?.companyName || "-"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg md:col-span-2">
                        <div className="bg-gray-200 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Membre depuis</p>
                          <p className="font-semibold text-gray-900">
                            {profile?.createdAt ? formatDate(profile.createdAt) : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {orders.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h3>
                    <p className="text-gray-600 mb-6">Vous n'avez pas encore passé de commande.</p>
                    <Link
                      href="/collections"
                      className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                    >
                      <ShoppingBag size={20} />
                      Découvrir nos produits
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        {/* Order Header */}
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div className="flex items-center gap-4">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-semibold text-gray-900">
                                Commande #{order.id.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatShortDate(order.createdAt)} • {order.items.length} article(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                            <span className="font-bold text-gray-900">€{order.total.toFixed(2)}</span>
                            {expandedOrder === order.id ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Order Details */}
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <h4 className="font-semibold text-gray-900 mb-3">Détails de la commande</h4>
                                <div className="space-y-3">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center gap-4 bg-white p-3 rounded-lg"
                                    >
                                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product?.image ? (
                                          <Image
                                            src={item.product.image}
                                            alt={item.product?.name || "Produit"}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                          {item.product?.name || `Produit #${item.productId}`}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {item.product?.brand}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                          €{(item.unitPrice * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {item.quantity} x €{item.unitPrice.toFixed(2)}
                                        </p>
                                      </div>
                                      <Link
                                        href={`/products/${item.productId}`}
                                        className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Eye size={18} />
                                      </Link>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                  <span className="text-gray-600">Total de la commande</span>
                                  <span className="text-xl font-bold text-gray-900">€{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
