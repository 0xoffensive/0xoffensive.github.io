"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  id: number;
  vardas: string;
  pavarde: string;
  e_pastas: string;
  slapyvardis: string;
  tel_nr: string | null;
  miestas: string | null;
  role: string;
  busena: string;
}

interface CompanyProfile {
  pavadinimas: string;
  miestas: string | null;
  pasto_kodas: string | null;
  adresas: string | null;
  pastato_nr: string | null;
  tel_nr: string | null;
  imones_kodas: string | null;
  pvm_kodas: string | null;
  svetaine: string | null;
}

export default function ProfilisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    vardas: "",
    pavarde: "",
    e_pastas: "",
    slapyvardis: "",
    tel_nr: "",
    miestas: "",
    naujasSlaptazodis: "",
    patvirtintiSlaptazodi: "",
    // Company fields
    imone: {
      pavadinimas: "",
      miestas: "",
      pasto_kodas: "",
      adresas: "",
      pastato_nr: "",
      tel_nr: "",
      imones_kodas: "",
      pvm_kodas: "",
      svetaine: "",
    },
  });

  const isPrivateSeller = userProfile && companyProfile ? 
    companyProfile.pavadinimas === `${userProfile.vardas} ${userProfile.pavarde}` : false;

  const handleGoBack = () => {
    router.back();
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profilis");
      if (!response.ok) {
        throw new Error("Nepavyko gauti profilio duomenų");
      }

      const data = await response.json();
      setUserProfile(data.user);
      setCompanyProfile(data.company);

      // Initialize form data
      setFormData({
        vardas: data.user.vardas || "",
        pavarde: data.user.pavarde || "",
        e_pastas: data.user.e_pastas || "",
        slapyvardis: data.user.slapyvardis || "",
        tel_nr: data.user.tel_nr || "",
        miestas: data.user.miestas || "",
        naujasSlaptazodis: "",
        patvirtintiSlaptazodi: "",
        imone: {
          pavadinimas: data.company?.pavadinimas || "",
          miestas: data.company?.miestas || "",
          pasto_kodas: data.company?.pasto_kodas || "",
          adresas: data.company?.adresas || "",
          pastato_nr: data.company?.pastato_nr || "",
          tel_nr: data.company?.tel_nr || "",
          imones_kodas: data.company?.imones_kodas || "",
          pvm_kodas: data.company?.pvm_kodas || "",
          svetaine: data.company?.svetaine || "",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Įvyko klaida");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validate passwords match
    if (formData.naujasSlaptazodis && formData.naujasSlaptazodis !== formData.patvirtintiSlaptazodi) {
      setError("Slaptažodžiai nesutampa");
      setSaving(false);
      return;
    }

    // Validate password length
    if (formData.naujasSlaptazodis && formData.naujasSlaptazodis.length < 6) {
      setError("Slaptažodis turi būti bent 6 simbolių");
      setSaving(false);
      return;
    }

    try {
      const updateData: any = {
        vardas: formData.vardas,
        pavarde: formData.pavarde,
        e_pastas: formData.e_pastas,
        slapyvardis: formData.slapyvardis,
        tel_nr: formData.tel_nr || null,
        miestas: formData.miestas || null,
      };

      if (formData.naujasSlaptazodis) {
        updateData.naujasSlaptazodis = formData.naujasSlaptazodis;
      }

      // Include company data if user is atstovas
      if (userProfile?.role === "atstovas") {
        if (isPrivateSeller) {
          // For private sellers, update company with user's city and phone
          updateData.imone = {
            pavadinimas: `${formData.vardas} ${formData.pavarde}`, // Keep the name as full name
            miestas: formData.miestas,
            tel_nr: formData.tel_nr,
            svetaine: companyProfile?.svetaine || null,
          };
        } else {
          // For companies, use the form company data
          updateData.imone = formData.imone;
        }
      }

      const response = await fetch("/api/profilis", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nepavyko atnaujinti profilio");
      }

      setSuccess("Profilis atnaujintas sėkmingai");

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        naujasSlaptazodis: "",
        patvirtintiSlaptazodi: "",
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : "Įvyko klaida");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompanyInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      imone: {
        ...prev.imone,
        [field]: value,
      },
    }));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-200/40 blur-3xl dark:bg-green-900/20" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-green-700 dark:text-green-400"
          >
            <span className="text-3xl">🌲</span>
            Dievų Giria
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Mano profilis</h1>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              ← Grįžti
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Asmeniniai duomenys</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="vardas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Vardas *
                  </label>
                  <input
                    type="text"
                    id="vardas"
                    value={formData.vardas}
                    onChange={(e) => handleInputChange("vardas", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pavarde" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Pavardė *
                  </label>
                  <input
                    type="text"
                    id="pavarde"
                    value={formData.pavarde}
                    onChange={(e) => handleInputChange("pavarde", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="e_pastas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    El. paštas *
                  </label>
                  <input
                    type="email"
                    id="e_pastas"
                    value={formData.e_pastas}
                    onChange={(e) => handleInputChange("e_pastas", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slapyvardis" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Slapyvardis *
                  </label>
                  <input
                    type="text"
                    id="slapyvardis"
                    value={formData.slapyvardis}
                    onChange={(e) => handleInputChange("slapyvardis", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tel_nr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Telefono numeris
                  </label>
                  <input
                    type="tel"
                    id="tel_nr"
                    value={formData.tel_nr}
                    onChange={(e) => handleInputChange("tel_nr", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                  />
                </div>

                <div>
                  <label htmlFor="miestas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Miestas
                  </label>
                  <input
                    type="text"
                    id="miestas"
                    value={formData.miestas}
                    onChange={(e) => handleInputChange("miestas", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                  />
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Slaptažodžio keitimas</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="naujasSlaptazodis" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Naujas slaptažodis
                  </label>
                  <input
                    type="password"
                    id="naujasSlaptazodis"
                    value={formData.naujasSlaptazodis}
                    onChange={(e) => handleInputChange("naujasSlaptazodis", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                    placeholder="Palikite tuščią jei nenorite keisti"
                  />
                </div>

                <div>
                  <label htmlFor="patvirtintiSlaptazodi" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Patvirtinti naują slaptažodį
                  </label>
                  <input
                    type="password"
                    id="patvirtintiSlaptazodi"
                    value={formData.patvirtintiSlaptazodi}
                    onChange={(e) => handleInputChange("patvirtintiSlaptazodi", e.target.value)}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information for Sellers */}
            {userProfile?.role === "atstovas" && (
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                  {isPrivateSeller ? "Pardavėjo informacija" : "Įmonės informacija"}
                </h2>
                
                {isPrivateSeller ? (
                  // Private seller fields
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="miestas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Miestas *
                      </label>
                      <input
                        type="text"
                        id="miestas"
                        value={formData.miestas}
                        onChange={(e) => handleInputChange("miestas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="tel_nr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Telefono nr. *
                      </label>
                      <input
                        type="tel"
                        id="tel_nr"
                        value={formData.tel_nr}
                        onChange={(e) => handleInputChange("tel_nr", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  // Company fields
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="imone_pavadinimas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Įmonės pavadinimas *
                      </label>
                      <input
                        type="text"
                        id="imone_pavadinimas"
                        value={formData.imone.pavadinimas}
                        onChange={(e) => handleCompanyInputChange("pavadinimas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="imone_kodas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Įmonės kodas *
                      </label>
                      <input
                        type="text"
                        id="imone_kodas"
                        value={formData.imone.imones_kodas}
                        onChange={(e) => handleCompanyInputChange("imones_kodas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="pvm_kodas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        PVM kodas
                      </label>
                      <input
                        type="text"
                        id="pvm_kodas"
                        value={formData.imone.pvm_kodas}
                        onChange={(e) => handleCompanyInputChange("pvm_kodas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="imone_miestas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Miestas
                      </label>
                      <input
                        type="text"
                        id="imone_miestas"
                        value={formData.imone.miestas}
                        onChange={(e) => handleCompanyInputChange("miestas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="imone_pasto_kodas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Pašto kodas
                      </label>
                      <input
                        type="text"
                        id="imone_pasto_kodas"
                        value={formData.imone.pasto_kodas}
                        onChange={(e) => handleCompanyInputChange("pasto_kodas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="imone_adresas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Adresas
                      </label>
                      <input
                        type="text"
                        id="imone_adresas"
                        value={formData.imone.adresas}
                        onChange={(e) => handleCompanyInputChange("adresas", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="imone_pastato_nr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Pastato nr.
                      </label>
                      <input
                        type="text"
                        id="imone_pastato_nr"
                        value={formData.imone.pastato_nr}
                        onChange={(e) => handleCompanyInputChange("pastato_nr", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="imone_tel_nr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Telefono nr.
                      </label>
                      <input
                        type="tel"
                        id="imone_tel_nr"
                        value={formData.imone.tel_nr}
                        onChange={(e) => handleCompanyInputChange("tel_nr", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="svetaine" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Svetainė (Neprivaloma)
                      </label>
                      <input
                        type="url"
                        id="svetaine"
                        value={formData.imone.svetaine}
                        onChange={(e) => handleCompanyInputChange("svetaine", e.target.value)}
                        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
                        placeholder="https://www.jusu-svetaine.lt"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center rounded-xl border border-transparent bg-green-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700"
              >
                {saving ? "Išsaugoma..." : "Išsaugoti pakeitimus"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}