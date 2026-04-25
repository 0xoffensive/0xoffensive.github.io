"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";

interface Skelbimas {
  id_Skelbimas: number;
  pavadinimas: string;
  aprasymas: string;
  kaina: number;
  statusas: string;
  data: string;
  imone_pavadinimas?: string;
  vartotojas_slapyvardis?: string;
}

export default function AdminSkelbimaiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [skelbimai, setSkelbimai] = useState<Skelbimas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingSkelbimas, setEditingSkelbimas] = useState<Skelbimas | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editForm, setEditForm] = useState({
    pavadinimas: "",
    aprasymas: "",
    kaina: "",
  });

  const validateSkelbimas = () => {
    const errors: Record<string, string> = {};
    
    if (!editForm.pavadinimas.trim()) {
      errors.pavadinimas = "Pavadinimas yra būtinas";
    } else if (editForm.pavadinimas.length > 255) {
      errors.pavadinimas = "Pavadinimas negali būti ilgesnis nei 255 simboliai";
    }
    
    if (editForm.aprasymas.length > 1000) {
      errors.aprasymas = "Aprašymas negali būti ilgesnis nei 1000 simbolių";
    }
    
    if (!editForm.kaina.trim()) {
      errors.kaina = "Kaina yra būtina";
    } else if (parseFloat(editForm.kaina) <= 0) {
      errors.kaina = "Kaina turi būti didesnė nei 0";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "administratorius") {
      router.push("/");
    } else {
      fetchSkelbimai();
    }
  }, [session, status, router]);

  const fetchSkelbimai = async () => {
    try {
      const res = await fetch("/api/admin/skelbimai");
      if (!res.ok) throw new Error("Nepavyko gauti skelbimų");
      const data = await res.json();
      setSkelbimai(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skelbimas: Skelbimas) => {
    setEditingSkelbimas(skelbimas);
    setEditForm({
      pavadinimas: skelbimas.pavadinimas ?? "",
      aprasymas: skelbimas.aprasymas ?? "",
      kaina: skelbimas.kaina.toString(),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSkelbimas) return;

    if (!validateSkelbimas()) {
      return;
    }

    try {
      const res = await fetch("/api/admin/skelbimai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSkelbimas.id_Skelbimas,
          action: "update",
          pavadinimas: editForm.pavadinimas,
          aprasymas: editForm.aprasymas,
          kaina: parseFloat(editForm.kaina),
        }),
      });

      if (!res.ok) throw new Error("Nepavyko atnaujinti skelbimo");

      setEditingSkelbimas(null);
      setValidationErrors({});
      fetchSkelbimai();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAction = async (id: number, action: string) => {
    try {
      const res = await fetch("/api/admin/skelbimai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
        }),
      });

      if (!res.ok) throw new Error("Nepavyko atlikti veiksmo");

      fetchSkelbimai();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Ar tikrai norite ištrinti šį skelbimą?")) return;

    try {
      const res = await fetch("/api/admin/skelbimai", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Nepavyko ištrinti skelbimo");

      // Refresh skelbimai list
      fetchSkelbimai();
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

  const filteredSkelbimai = skelbimai.filter(
    (skelbimas) =>
      skelbimas.pavadinimas.toLowerCase().includes(searchFilter.toLowerCase()) ||
      skelbimas.vartotojas_slapyvardis?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      skelbimas.imone_pavadinimas?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <div className="pt-32 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Skelbimų valdymas
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
              placeholder="Ieškoti pagal pavadinimą, pardavėją..."
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
                    Pavadinimas
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Kaina
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Statusas
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Pardavėjas
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Data
                  </th>
                  <th className="border border-zinc-200 p-3 text-left dark:border-zinc-700">
                    Veiksmai
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSkelbimai.map((skelbimas) => (
                  <tr key={skelbimas.id_Skelbimas} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {skelbimas.id_Skelbimas}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {skelbimas.pavadinimas}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      €{skelbimas.kaina}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {skelbimas.statusas}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {skelbimas.vartotojas_slapyvardis || skelbimas.imone_pavadinimas || "Nežinomas"}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      {new Date(skelbimas.data).toLocaleDateString("lt-LT")}
                    </td>
                    <td className="border border-zinc-200 p-3 dark:border-zinc-700">
                      <div className="flex flex-wrap gap-2">
                        {skelbimas.statusas !== "aktyvus" && (
                          <button
                            onClick={() => handleAction(skelbimas.id_Skelbimas, "activate")}
                            className="flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                          >
                            ✓ Aktyvuoti
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(skelbimas)}
                          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          ✏️ Redaguoti
                        </button>
                        <button
                          onClick={() => handleDelete(skelbimas.id_Skelbimas)}
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

          {/* Edit Skelbimas Modal */}
          {editingSkelbimas && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <span>✏️</span> Redaguoti skelbimą
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Atnaujinkite skelbimo informaciją</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Pavadinimas
                    </label>
                    <input
                      type="text"
                      value={editForm.pavadinimas}
                      onChange={(e) => setEditForm({ ...editForm, pavadinimas: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.pavadinimas ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.pavadinimas && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.pavadinimas}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Aprašymas
                    </label>
                    <textarea
                      value={editForm.aprasymas}
                      onChange={(e) => setEditForm({ ...editForm, aprasymas: e.target.value })}
                      rows={4}
                      className={`w-full rounded-xl border ${validationErrors.aprasymas ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all resize-none`}
                    />
                    {validationErrors.aprasymas && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.aprasymas}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                      Kaina (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.kaina}
                      onChange={(e) => setEditForm({ ...editForm, kaina: e.target.value })}
                      className={`w-full rounded-xl border ${validationErrors.kaina ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-white dark:bg-zinc-800/50 px-4 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:focus:border-green-400 dark:focus:ring-green-400 transition-all`}
                    />
                    {validationErrors.kaina && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">⚠️ {validationErrors.kaina}</p>
                    )}
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditingSkelbimas(null);
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