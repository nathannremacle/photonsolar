"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Package, Eye, CheckCircle2, XCircle, Clock, User, Building2, Phone, Mail, X, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
import { safeFetchJson } from "@/utils/api";
import { useToastContext } from "@/contexts/ToastContext";

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

interface OrderUser {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string;
  companyName: string | null;
}

interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  total: number;
  createdAt: Date;
  updatedAt: Date;
  user: OrderUser;
  items: OrderItem[];
}

const ORDERS_PER_PAGE = 25;
type SortKey = "date" | "total" | "status" | "client";
type SortDir = "asc" | "desc";

function AdminOrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToastContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "PENDING" || filter === "COMPLETED" || filter === "CANCELLED") {
      setFilterStatus(filter);
    }
  }, [searchParams]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!authenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      loadOrders(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [authenticated, autoRefresh]);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push("/admin");
      return;
    }
    setAuthenticated(true);
    loadOrders();
  }, [router]);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setIsRefreshing(true);
      const { data, error } = await safeFetchJson<{ orders: Order[] }>("/api/admin/orders");

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }

      if (data?.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
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

  const updateOrderStatus = async (orderId: string, status: "PENDING" | "COMPLETED" | "CANCELLED") => {
    try {
      setUpdating(orderId);
      const { data, error } = await safeFetchJson<{ order: Order }>("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });

      if (error || !data?.order) {
        toast.error(error || "Erreur lors de la mise à jour de la commande");
        return;
      }

      // Update orders list
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? data.order : order))
      );

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(data.order);
      }

      toast.success("Statut de la commande mis à jour avec succès");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erreur lors de la mise à jour de la commande");
    } finally {
      setUpdating(null);
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
        return "En attente";
    }
  };

  const filteredOrders = useMemo(() => {
    let list = orders.filter((order) => {
      if (filterStatus === "all") return true;
      return order.status === filterStatus;
    });
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === "total") cmp = a.total - b.total;
      else if (sortKey === "status") cmp = (a.status || "").localeCompare(b.status || "");
      else if (sortKey === "client") cmp = (a.user?.name || a.user?.email || "").localeCompare(b.user?.name || b.user?.email || "");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [orders, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(
    () => filteredOrders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE),
    [filteredOrders, page]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    totalRevenue: orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + o.total, 0),
  };

  if (!authenticated) {
    return null;
  }

  return (
    <AdminLayout title="Commandes" description="Gestion des commandes clients">
      <div className="space-y-6">
        {/* Auto-refresh indicator */}
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => loadOrders()}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">En attente</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Terminées</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Annulées</div>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Chiffre d'affaires</div>
            <div className="text-2xl font-bold text-gray-900">€ {stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Toutes</option>
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Terminées</option>
              <option value="CANCELLED">Annulées</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucune commande trouvée</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button type="button" onClick={() => toggleSort("client")} className="flex items-center gap-1 hover:text-gray-700">
                          Client {sortKey === "client" && (sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button type="button" onClick={() => toggleSort("date")} className="flex items-center gap-1 hover:text-gray-700">
                          Date {sortKey === "date" && (sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button type="button" onClick={() => toggleSort("total")} className="flex items-center gap-1 hover:text-gray-700">
                          Total {sortKey === "total" && (sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button type="button" onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-gray-700">
                          Statut {sortKey === "status" && (sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} article{order.items.length > 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.name || order.user.email}
                        </div>
                        {order.user.companyName && (
                          <div className="text-sm text-gray-500">{order.user.companyName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        € {order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-orange-600 hover:text-orange-700 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Détails
                        </button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg">
                <p className="text-sm text-gray-600">
                  {((page - 1) * ORDERS_PER_PAGE) + 1}–{Math.min(page * ORDERS_PER_PAGE, filteredOrders.length)} sur {filteredOrders.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Commande #{selectedOrder.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations client</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <strong>Nom:</strong> {selectedOrder.user.name || "Non renseigné"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <strong>Email:</strong> {selectedOrder.user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <strong>Téléphone:</strong> {selectedOrder.user.phoneNumber}
                    </span>
                  </div>
                  {selectedOrder.user.companyName && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        <strong>Entreprise:</strong> {selectedOrder.user.companyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.product?.name || item.productId}</div>
                        <div className="text-sm text-gray-500">{item.product?.brand || "Marque inconnue"}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Quantité: {item.quantity} × € {item.unitPrice.toFixed(2)} = €{" "}
                          {(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    € {selectedOrder.total.toFixed(2)}
                  </span>
                </div>

                {/* Status Update */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le statut</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as "PENDING" | "COMPLETED" | "CANCELLED";
                        updateOrderStatus(selectedOrder.id, newStatus);
                      }}
                      disabled={updating === selectedOrder.id}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50"
                    >
                      <option value="PENDING">En attente</option>
                      <option value="COMPLETED">Terminée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                    {updating === selectedOrder.id && (
                      <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AdminOrders() {
  return (
    <Suspense
      fallback={
        <AdminLayout title="Commandes" description="Chargement...">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Chargement des commandes...</p>
          </div>
        </AdminLayout>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
