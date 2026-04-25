"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

interface User {
  id_Vartotojas: number;
  vardas: string;
  pavarde: string;
  e_pastas: string;
  slapyvardis: string;
  role: string;
  busena: string;
  tel_nr?: string;
  miestas?: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState({
    vardas: "",
    pavarde: "",
    slapyvardis: "",
    role: "",
    busena: "",
    tel_nr: "",
    miestas: "",
  });

  const validateUser = () => {
    const errors: Record<string, string> = {};
    
    if (!editForm.vardas.trim()) {
      errors.vardas = "Vardas yra būtinas";
    } else if (editForm.vardas.length > 255) {
      errors.vardas = "Vardas negali būti ilgesnis nei 255 simboliai";
    }
    
    if (!editForm.pavarde.trim()) {
      errors.pavarde = "Pavardė yra būtina";
    } else if (editForm.pavarde.length > 255) {
      errors.pavarde = "Pavardė negali būti ilgesnė nei 255 simboliai";
    }
    
    if (!editForm.slapyvardis.trim()) {
      errors.slapyvardis = "Slapyvardis yra būtinas";
    } else if (editForm.slapyvardis.length > 255) {
      errors.slapyvardis = "Slapyvardis negali būti ilgesnis nei 255 simboliai";
    }
    
    if (!editForm.role) {
      errors.role = "Rolė yra būtina";
    }
    
    if (!editForm.busena) {
      errors.busena = "Būsena yra būtina";
    }
    
    if (editForm.tel_nr && editForm.tel_nr.length > 20) {
      errors.tel_nr = "Telefonas negali būti ilgesnis nei 20 simbolių";
    }
    
    if (editForm.miestas && editForm.miestas.length > 255) {
      errors.miestas = "Miestas negali būti ilgesnis nei 255 simboliai";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "administratorius") {
      router.push("/");
    } else {
      fetchUsers();
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Nepavyko gauti vartotojų");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      vardas: user.vardas ?? "",
      pavarde: user.pavarde ?? "",
      slapyvardis: user.slapyvardis ?? "",
      role: user.role ?? "",
      busena: user.busena ?? "",
      tel_nr: user.tel_nr ?? "",
      miestas: user.miestas ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    if (!validateUser()) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id_Vartotojas,
          action: "update",
          ...editForm,
        }),
      });

      if (!res.ok) throw new Error("Nepavyko atnaujinti vartotojo");

      setEditingUser(null);
      setValidationErrors({});
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAction = async (id: number, action: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (!res.ok) throw new Error("Veiksmas nepavyko");

      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ar tikrai norite ištrinti šį vartotoją?")) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Nepavyko ištrinti vartotojo");

      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  if (!session || (session.user as any).role !== "administratorius") {
    return null;
  }

  const filteredUsers = users.filter(
    (user) =>
      user.vardas.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.pavarde.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.slapyvardis.toLowerCase().includes(searchFilter.toLowerCase()) ||
      user.e_pastas.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="pt-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Vartotojų valdymas
            </h1>
            <Link
              href="/admin"
              className="text-green-700 hover:underline dark:text-green-400"
            >
              ← Grįžti į admin panelę
            </Link>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Ieškoti pagal vardą, pavardę, slapyvardį, el. paštą..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-green-600 focus:ring-1 focus:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-zinc-200 dark:border-zinc-700">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800">
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    ID
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Vardas
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Pavardė
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Slapyvardis
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    El. paštas
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Rolė
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Būsena
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Veiksmai
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id_Vartotojas} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.id_Vartotojas}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.vardas}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.pavarde}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.slapyvardis}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.e_pastas}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.role}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {user.busena}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      <div className="flex flex-wrap gap-2">
                        {user.busena === "laukia_patvirtinimo" && (
                          <button
                            onClick={() => handleAction(user.id_Vartotojas, "approve")}
                            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                          >
                            ✓ Patvirtinti
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          ✏️ Redaguoti
                        </button>
                        <button
                          onClick={() => handleDelete(user.id_Vartotojas)}
                          className="flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                        >
                          🗑️ Ištrinti
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>👤</span> Redaguoti vartotoją
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Atnaujinkite vartotojo informaciją</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Vardas
                    </label>
                    <input
                      type="text"
                      value={editForm.vardas}
                      onChange={(e) => setEditForm({ ...editForm, vardas: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.vardas ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.vardas && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.vardas}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Pavardė
                    </label>
                    <input
                      type="text"
                      value={editForm.pavarde}
                      onChange={(e) => setEditForm({ ...editForm, pavarde: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.pavarde ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.pavarde && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.pavarde}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Slapyvardis
                    </label>
                    <input
                      type="text"
                      value={editForm.slapyvardis}
                      onChange={(e) => setEditForm({ ...editForm, slapyvardis: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.slapyvardis ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.slapyvardis && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.slapyvardis}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Rolė
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.role ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    >
                      <option value="">-- Pasirinkite rolę --</option>
                      <option value="vartotojas">Vartotojas</option>
                      <option value="atstovas">Atstovas</option>
                      <option value="administratorius">Administratorius</option>
                    </select>
                    {validationErrors.role && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.role}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Būsena
                    </label>
                    <select
                      value={editForm.busena}
                      onChange={(e) => setEditForm({ ...editForm, busena: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.busena ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    >
                      <option value="">-- Pasirinkite būseną --</option>
                      <option value="laukia_patvirtinimo">Laukia patvirtinimo</option>
                      <option value="aktyvus">Aktyvus</option>
                      <option value="sustabdytas">Sustabdyta</option>
                    </select>
                    {validationErrors.busena && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.busena}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Telefonas
                    </label>
                    <input
                      type="text"
                      value={editForm.tel_nr}
                      onChange={(e) => setEditForm({ ...editForm, tel_nr: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.tel_nr ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.tel_nr && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.tel_nr}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Miestas
                    </label>
                    <input
                      type="text"
                      value={editForm.miestas}
                      onChange={(e) => setEditForm({ ...editForm, miestas: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.miestas ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.miestas && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.miestas}</p>
                    )}
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setValidationErrors({});
                    }}
                    className="px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Atšaukti
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={Object.keys(validationErrors).length > 0}
                  >
                    Išsaugoti
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}