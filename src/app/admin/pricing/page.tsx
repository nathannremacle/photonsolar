"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import ConfirmModal from "@/components/admin/ConfirmModal";
import {
  BadgeDollarSign,
  Plus,
  Trash2,
  RefreshCw,
  Percent,
  Euro,
  User,
  Building2,
  Shield,
} from "lucide-react";
import { safeFetchJson } from "@/utils/api";
import { useToastContext } from "@/contexts/ToastContext";

type Scope = "ROLE" | "USER" | "COMPANY";
type PricingType = "PERCENT_DISCOUNT" | "FIXED_PRICE";
type UserRole = "PARTICULIER" | "INSTALLATEUR" | "REVENDEUR" | "AUTRE";

interface PricingRuleRow {
  id: string;
  scope: Scope;
  role: UserRole | null;
  userId: string | null;
  companyName: string | null;
  productId: string;
  productName: string;
  productPrice: number | null;
  type: PricingType;
  value: number;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

interface UserRow {
  id: string;
  name: string | null;
  email: string;
}

interface ProductRow {
  id: string;
  name: string;
  price?: number | null;
}

const ROLE_LABELS: Record<string, string> = {
  PARTICULIER: "Particulier",
  INSTALLATEUR: "Installateur",
  REVENDEUR: "Revendeur",
  AUTRE: "Autre",
};

export default function AdminPricingPage() {
  const router = useRouter();
  const toast = useToastContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState<PricingRuleRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    scope: "ROLE" as Scope,
    role: "INSTALLATEUR" as UserRole,
    userId: "",
    companyName: "",
    productId: "",
    type: "PERCENT_DISCOUNT" as PricingType,
    value: "10",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push("/admin");
      return;
    }
    setAuthenticated(true);
    loadAll();
  }, [router]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [rulesRes, usersRes, productsRes] = await Promise.all([
        safeFetchJson<{ rules: PricingRuleRow[] }>("/api/admin/pricing"),
        safeFetchJson<{ users: UserRow[] }>("/api/admin/users"),
        safeFetchJson<{ products: ProductRow[] }>("/api/products"),
      ]);
      if (rulesRes.data?.rules) setRules(rulesRes.data.rules);
      if (usersRes.data?.users) setUsers(usersRes.data.users);
      if (productsRes.data?.products) setProducts(productsRes.data.products);
    } catch (e) {
      console.error("Load pricing data error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getTargetLabel = (r: PricingRuleRow) => {
    if (r.scope === "ROLE" && r.role) return `Rôle: ${ROLE_LABELS[r.role] || r.role}`;
    if (r.scope === "USER" && r.user) return `User: ${r.user.name || r.user.email}`;
    if (r.scope === "COMPANY" && r.companyName) return `Entreprise: ${r.companyName}`;
    return r.scope;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.productId) {
      setError("Choisissez un produit.");
      return;
    }
    const valueNum = form.type === "PERCENT_DISCOUNT" ? parseFloat(form.value) : parseFloat(form.value);
    if (isNaN(valueNum) || valueNum < 0) {
      setError("Valeur invalide.");
      return;
    }
    if (form.type === "PERCENT_DISCOUNT" && valueNum > 100) {
      setError("La réduction en % doit être entre 0 et 100.");
      return;
    }
    if (form.scope === "USER" && !form.userId) {
      setError("Choisissez un utilisateur.");
      return;
    }
    if (form.scope === "COMPANY" && !form.companyName.trim()) {
      setError("Saisissez le nom de l'entreprise.");
      return;
    }
    try {
      setSubmitting(true);
      const body: Record<string, unknown> = {
        scope: form.scope,
        productId: form.productId,
        type: form.type,
        value: valueNum,
      };
      if (form.scope === "ROLE") body.role = form.role;
      if (form.scope === "USER") body.userId = form.userId;
      if (form.scope === "COMPANY") body.companyName = form.companyName.trim();
      const { data, error: err } = await safeFetchJson<{ rule: PricingRuleRow }>(
        "/api/admin/pricing",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (err) {
        setError(err);
        return;
      }
      if (data?.rule) {
        setRules((prev) => [
          ...prev,
          {
            ...data.rule,
            productName: products.find((p) => p.id === data.rule.productId)?.name ?? data.rule.productId,
            productPrice: products.find((p) => p.id === data.rule.productId)?.price ?? null,
          },
        ]);
      }
      setForm({ ...form, value: "10", productId: "", userId: "", companyName: "" });
      toast.success("Règle ajoutée");
    } catch (e) {
      console.error("Submit pricing rule error:", e);
      setError("Erreur lors de l'ajout de la règle.");
      toast.error("Erreur lors de l'ajout de la règle.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => setConfirmDeleteId(id);

  const handleDeleteConfirm = async () => {
    const id = confirmDeleteId;
    if (!id) return;
    try {
      setDeletingId(id);
      const { error: err } = await safeFetchJson(`/api/admin/pricing/${id}`, {
        method: "DELETE",
      });
      setConfirmDeleteId(null);
      if (err) {
        toast.error(err);
        return;
      }
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast.success("Règle supprimée");
    } catch (e) {
      console.error("Delete rule error:", e);
      toast.error("Erreur lors de la suppression.");
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  if (!authenticated) return null;

  return (
    <AdminLayout
      title="Tarification"
      description="Prix différenciés par rôle, utilisateur ou entreprise"
    >
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {rules.length} règle{rules.length !== 1 ? "s" : ""} de tarification
          </p>
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {/* Add rule form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Ajouter une règle
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cible
                </label>
                <select
                  value={form.scope}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scope: e.target.value as Scope }))
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                >
                  <option value="ROLE">Par rôle</option>
                  <option value="USER">Par utilisateur</option>
                  <option value="COMPANY">Par entreprise</option>
                </select>
              </div>
              {form.scope === "ROLE" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as UserRole }))
                    }
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                  >
                    <option value="PARTICULIER">Particulier</option>
                    <option value="INSTALLATEUR">Installateur</option>
                    <option value="REVENDEUR">Revendeur</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              )}
              {form.scope === "USER" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Utilisateur
                  </label>
                  <select
                    value={form.userId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userId: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                  >
                    <option value="">— Choisir —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {form.scope === "COMPANY" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom entreprise
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, companyName: e.target.value }))
                    }
                    placeholder="Ex: Solar Pro"
                    className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit
                </label>
                <select
                  value={form.productId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, productId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                >
                  <option value="">— Choisir —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.price != null ? `(${p.price} €)` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as PricingType,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                >
                  <option value="PERCENT_DISCOUNT">Réduction %</option>
                  <option value="FIXED_PRICE">Prix fixe (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.type === "PERCENT_DISCOUNT" ? "Réduction (%)" : "Prix (€)"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={form.type === "PERCENT_DISCOUNT" ? 100 : undefined}
                  step={form.type === "PERCENT_DISCOUNT" ? 1 : 0.01}
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              <BadgeDollarSign className="h-4 w-4" />
              Ajouter la règle
            </button>
          </form>
        </div>

        {/* Rules list */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">
            Règles en vigueur
          </h2>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cible
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valeur
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rules.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {r.scope === "ROLE" && (
                          <span className="inline-flex items-center gap-1">
                            <Shield className="h-4 w-4 text-gray-400" />
                            {ROLE_LABELS[r.role!] ?? r.role}
                          </span>
                        )}
                        {r.scope === "USER" && r.user && (
                          <span className="inline-flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-400" />
                            {r.user.name || r.user.email}
                          </span>
                        )}
                        {r.scope === "COMPANY" && (
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            {r.companyName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {r.productName}
                        {r.productPrice != null && (
                          <span className="text-gray-500 ml-1">
                            (base: {r.productPrice} €)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {r.type === "PERCENT_DISCOUNT" ? (
                          <span className="inline-flex items-center gap-1 text-orange-600">
                            <Percent className="h-4 w-4" />
                            Réduction %
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Euro className="h-4 w-4" />
                            Prix fixe
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {r.type === "PERCENT_DISCOUNT"
                          ? `${r.value} %`
                          : `${r.value} €`}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(r.id)}
                          disabled={deletingId === r.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && rules.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Aucune règle. Ajoutez une règle ci-dessus pour appliquer des prix
              différents par rôle, utilisateur ou entreprise.
            </div>
          )}
        </div>
      </div>
      <ConfirmModal
        open={confirmDeleteId !== null}
        title="Supprimer la règle"
        message="Voulez-vous vraiment supprimer cette règle de tarification ?"
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDeleteId(null)}
        loading={deletingId !== null}
      />
    </AdminLayout>
  );
}
