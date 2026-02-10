"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAdminSession } from "@/lib/admin-auth";
import AdminLayout from "@/components/admin/AdminLayout";
import { User as UserIcon, Mail, Phone, Building2, RefreshCw, Save } from "lucide-react";
import { safeFetchJson } from "@/utils/api";
import { useToastContext } from "@/contexts/ToastContext";

type UserRole = "PARTICULIER" | "INSTALLATEUR" | "REVENDEUR" | "AUTRE" | null;

interface User {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string;
  companyName: string | null;
  role: UserRole;
  createdAt: string;
}

const USERS_PER_PAGE = 25;

const ROLE_LABELS: Record<string, string> = {
  PARTICULIER: "Particulier",
  INSTALLATEUR: "Installateur",
  REVENDEUR: "Revendeur",
  AUTRE: "Autre",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const toast = useToastContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleEdits, setRoleEdits] = useState<Record<string, UserRole>>({});
  const [page, setPage] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAdminSession()) {
      router.push("/admin");
      return;
    }
    setAuthenticated(true);
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await safeFetchJson<{ users: User[] }>("/api/admin/users", {
        credentials: "include",
      });
      if (error || !data?.users) {
        const msg = error || "Réponse invalide du serveur";
        setLoadError(msg);
        console.error("Load users error:", msg);
        setUsers([]);
        return;
      }
      setUsers(data.users);
      setRoleEdits({});
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors du chargement";
      setLoadError(msg);
      console.error("Load users error:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    setRoleEdits((prev) => ({ ...prev, [userId]: role }));
  };

  const saveRole = async (user: User) => {
    const role = roleEdits[user.id] ?? user.role;
    if (role === user.role) return;
    try {
      setUpdatingId(user.id);
      const { data, error } = await safeFetchJson<{ user: User }>(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      );
      if (error || !data?.user) {
        toast.error(error || "Erreur lors de la mise à jour du rôle");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: data.user.role } : u))
      );
      setRoleEdits((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
      toast.success("Rôle mis à jour");
    } catch (e) {
      console.error("Save role error:", e);
      toast.error("Erreur lors de la mise à jour du rôle");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!authenticated) return null;

  return (
    <AdminLayout title="Utilisateurs" description="Liste des inscrits et gestion des rôles">
      <div className="space-y-6">
        {loadError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            Impossible de charger la liste : {loadError}
            {loadError.includes("401") || loadError.toLowerCase().includes("autorisé") ? " Vérifiez que vous êtes bien connecté à l'admin." : ""}
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {users.length} utilisateur{users.length !== 1 ? "s" : ""} inscrit
            {users.length !== 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
          </div>
        ) : (
          <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Utilisateur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Entreprise
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rôle
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE).map((user) => {
                    const currentRole = roleEdits[user.id] ?? user.role;
                    const hasChange = currentRole !== user.role;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {user.name || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Mail className="h-3.5 w-3.5" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {user.phoneNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.companyName ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3.5 w-3.5" />
                              {user.companyName}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={currentRole ?? ""}
                            onChange={(e) =>
                              handleRoleChange(
                                user.id,
                                e.target.value === "" ? null : (e.target.value as UserRole)
                              )
                            }
                            className="block w-full max-w-[180px] rounded-lg border border-gray-300 py-1.5 pl-2 pr-8 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Non défini</option>
                            <option value="PARTICULIER">Particulier</option>
                            <option value="INSTALLATEUR">Installateur</option>
                            <option value="REVENDEUR">Revendeur</option>
                            <option value="AUTRE">Autre</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {hasChange && (
                            <button
                              type="button"
                              onClick={() => saveRole(user)}
                              disabled={updatingId === user.id}
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg disabled:opacity-50"
                            >
                              <Save className="h-4 w-4" />
                              Enregistrer
                            </button>
                          )}
                          {updatingId === user.id && (
                            <span className="text-xs text-gray-500">Enregistrement…</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucun utilisateur inscrit.
              </div>
            )}
          </div>
          {users.length > USERS_PER_PAGE && (
            <div className="flex items-center justify-between px-4 py-3 bg-white border border-t-0 border-gray-200 rounded-b-lg">
              <p className="text-sm text-gray-600">
                {((page - 1) * USERS_PER_PAGE) + 1}–{Math.min(page * USERS_PER_PAGE, users.length)} sur {users.length}
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
                  onClick={() => setPage((p) => Math.min(Math.ceil(users.length / USERS_PER_PAGE), p + 1))}
                  disabled={page >= Math.ceil(users.length / USERS_PER_PAGE)}
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
    </AdminLayout>
  );
}
