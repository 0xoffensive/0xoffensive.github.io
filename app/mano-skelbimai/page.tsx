"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function ManoSkelbimaiPage() {
  const { data: session, status } = useSession();
  const [skelbimai, setSkelbimai] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchSkelbimai();
  }, [status]);

  const fetchSkelbimai = async () => {
    try {
      const res = await fetch("/api/mano-skelbimai");
      const data = await res.json();
      setSkelbimai(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    // Treat 'galimas' as 'aktyvus' for backwards compatibility
    const isCurrentlyActive = currentStatus === "aktyvus" || currentStatus === "galimas";
    const newStatus = isCurrentlyActive ? "neaktyvus" : "aktyvus";
    
    try {
      const res = await fetch(`/api/skelbimai/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusas: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setSkelbimai(prev => prev.map(s => s.id_Skelbimas === id ? { ...s, statusas: newStatus } : s));
    } catch (err) {
      alert("Nepavyko atnaujinti statuso");
    }
  };

  const deleteSkelbimas = async (id: number) => {
    if (!confirm("Ar tikrai norite ištrinti šį skelbimą?")) return;
    try {
      const res = await fetch(`/api/skelbimai/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSkelbimai(prev => prev.filter(s => s.id_Skelbimas !== id));
    } catch (err) {
      alert("Nepavyko ištrinti skelbimo");
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-white dark:bg-zinc-950"><Navbar /><div className="pt-32 text-center">Kraunama...</div></div>;
  }

  if (!session || ((session.user as any).role !== "atstovas" && (session.user as any).role !== "administratorius")) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-32 px-6 text-center text-red-500">Neturite teisių peržiūrėti šio puslapio.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pt-24 pb-8">
        <div className="mx-auto max-w-5xl px-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mano Skelbimai</h1>
          <Link href="/skelbimas/kurti" className="rounded-xl bg-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-700/25 hover:bg-green-800">
            + Naujas skelbimas
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {skelbimai.length === 0 ? (
          <div className="text-center p-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500 mb-4">Jūs neturite jokių sukurtų skelbimų.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(skelbimai) ? (
              skelbimai.map(skelbimas => {
                const isAktyvus = skelbimas.statusas === "aktyvus";
              
              return (
                <div key={skelbimas.id_Skelbimas} className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 ${!isAktyvus ? "opacity-75" : ""}`}>
                  <div className="h-40 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-4 flex items-center justify-center relative">
                    {skelbimas.nuotrauka ? (
                      <img
                        src={skelbimas.nuotrauka}
                        alt={skelbimas.pavadinimas}
                        className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🌲</span>
                    )}
                    {!isAktyvus && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">Neaktyvus</div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold truncate">{skelbimas.pavadinimas}</h3>
                  <p className="text-green-700 dark:text-green-400 font-bold mb-4">{Number(skelbimas.kaina).toFixed(2)} €</p>

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/skelbimas/${skelbimas.id_Skelbimas}/redaguoti`}
                      className="w-full text-center rounded-lg py-2 text-sm font-semibold border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer block"
                    >
                      ✏️ Redaguoti
                    </Link>
                    <button
                      onClick={() => toggleStatus(skelbimas.id_Skelbimas, skelbimas.statusas)}
                      className={`w-full rounded-lg py-2 text-sm font-semibold border transition-all ${
                        isAktyvus 
                          ? "border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" 
                          : "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                    >
                      {isAktyvus ? "⏸ Pristabdyti (Paslėpti)" : "▶ Aktyvuoti (Rodyti)"}
                    </button>

                    <button
                      onClick={() => deleteSkelbimas(skelbimas.id_Skelbimas)}
                      className="w-full rounded-lg py-2 text-sm font-semibold border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      🗑 Ištrinti
                    </button>
                  </div>
                </div>
              );
            })) : (
              <div className="text-center p-12 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <p className="text-red-500">Įvyko klaida. Negalima gauti skelbimų.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}