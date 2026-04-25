"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";

const inputClass = "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400";

export default function EditSkelbimasPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    pavadinimas: "",
    aprasymas: "",
    kaina: "",
    min_kiekis: "",
    vieta: "",
    amzius: "",
    aukstis: "",
    plotis: "",
    lotyniskas_pav: "",
    tipas: "",
    kilme: "",
    atstumas: "",
    pristatymo_budas: "atsiimti_patiems",
    nuotrauka: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/skelbimai?id=${id}`).then(r => r.json()).then(data => {
      const s = data.find((s: any) => s.id_Skelbimas === parseInt(id)) || data[0];
      if (s) {
        setForm({
          pavadinimas: s.pavadinimas || "",
          aprasymas: s.aprasymas || "",
          kaina: s.kaina || "",
          min_kiekis: s.min_kiekis || "",
          vieta: s.vieta || "",
          amzius: s.amzius || "",
          aukstis: s.aukstis || "",
          plotis: s.plotis || "",
          lotyniskas_pav: s.lotyniskas_pav || "",
          tipas: s.tipas || "",
          kilme: s.kilme || "",
          atstumas: s.atstumas || "",
          pristatymo_budas: s.pristatymo_budas || "atsiimti_patiems",
          nuotrauka: s.nuotrauka || "",
        });
        if (s.nuotrauka) setImagePreview(s.nuotrauka);
      }
      setFetching(false);
    });
  }, [id]);

  if (status !== "loading" && (!session || (session.user as any).role !== "atstovas")) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-32 px-6 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Tik atstovai gali redaguoti.</p>
          <Link href="/mano-skelbimai" className="text-green-700 mt-4 inline-block hover:underline">Grįžti atgal</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setImagePreview(dataUrl);
        setForm({ ...form, nuotrauka: dataUrl });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/skelbimai/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Nepavyko atnaujinti skelbimo");
      }

      router.push("/mano-skelbimai");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || fetching) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="pt-32 px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <Navbar />

      <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-6">
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">Skelbimai</span>
          <h1 className="mt-2 text-3xl font-bold">Redaguoti skelbimą</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 p-8 space-y-6">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Skelbimo nuotrauka</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-3xl">📷</div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-zinc-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-zinc-50 file:text-zinc-700
                      hover:file:bg-zinc-700
                      dark:file:bg-zinc-800 dark:file:text-zinc-300" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Pavadinimas *</label>
                <input required name="pavadinimas" value={form.pavadinimas} onChange={handleChange} className={inputClass} placeholder="Pvz. Paprastoji eglė" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Lotyniškas pavadinimas</label>
                <input name="lotyniskas_pav" value={form.lotyniskas_pav} onChange={handleChange} className={inputClass} placeholder="Picea abies" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Kaina (€) *</label>
                <input required type="number" step="0.01" min="0" name="kaina" value={form.kaina} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Minimalus kiekis</label>
                <input type="number" name="min_kiekis" value={form.min_kiekis} onChange={handleChange} className={inputClass} placeholder="1" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Amžius (metai)</label>
                <input type="number" name="amzius" value={form.amzius} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Aukštis (cm)</label>
                <input type="number" name="aukstis" value={form.aukstis} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Plotis (cm)</label>
                <input type="number" name="plotis" value={form.plotis} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Vieta</label>
                <input name="vieta" value={form.vieta} onChange={handleChange} className={inputClass} placeholder="Miestas / Rajonas" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Kilmė</label>
                <input name="kilme" value={form.kilme} onChange={handleChange} className={inputClass} placeholder="Lietuva" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Aprašymas</label>
              <textarea name="aprasymas" value={form.aprasymas} onChange={handleChange} rows={4} className={inputClass}></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-700/25">
              {loading ? "Saugoma..." : "Išsaugoti pakeitimus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}