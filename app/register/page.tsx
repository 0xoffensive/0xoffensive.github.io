"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400";

export default function RegisterPage() {
  const router = useRouter();

  // User fields
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [ePastas, setEPastas] = useState("");
  const [slapyvardis, setSlapyvardis] = useState("");
  const [slaptazodis, setSlaptazodis] = useState("");
  const [confirmSlaptazodis, setConfirmSlaptazodis] = useState("");
  
  // Main role: "vartotojas" (Pirkėjas) or "atstovas" (Pardavėjas)
  const [role, setRole] = useState<"vartotojas" | "atstovas">("vartotojas");
  
  // Sub-role toggle for Pardavėjas
  const [isPrivate, setIsPrivate] = useState(false);

  // Private Seller fields
  const [miestas, setMiestas] = useState("");
  const [telNr, setTelNr] = useState("");
  const [privatusSvetaine, setPrivatusSvetaine] = useState("");

  // Imone fields (only for company)
  const [imonePavadinimas, setImonePavadinimas] = useState("");
  const [imoneKodas, setImoneKodas] = useState("");
  const [imonePvmKodas, setImonePvmKodas] = useState("");
  const [imoneMiestas, setImoneMiestas] = useState("");
  const [imoneAdresas, setImoneAdresas] = useState("");
  const [imonePastatoNr, setImonePastatoNr] = useState("");
  const [imonePastoKodas, setImonePastoKodas] = useState("");
  const [imoneTelNr, setImoneTelNr] = useState("");
  const [imoneSvetaine, setImoneSvetaine] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (slaptazodis !== confirmSlaptazodis) {
      setError("Slaptažodžiai nesutampa.");
      return;
    }

    if (slaptazodis.length < 6) {
      setError("Slaptažodis turi būti bent 6 simbolių.");
      return;
    }

    // Determine the actual role string to send to the API
    const effectiveRole = role === "atstovas" && isPrivate ? "privatus_pardavejas" : role;

    if (effectiveRole === "atstovas" && (!imonePavadinimas || !imoneKodas)) {
      setError("Įmonės pavadinimas ir įmonės kodas yra privalomi.");
      return;
    }

    if (effectiveRole === "privatus_pardavejas" && (!miestas || !telNr)) {
      setError("Miestas ir telefono numeris yra privalomi.");
      return;
    }

    setLoading(true);

    try {
      const body: Record<string, unknown> = {
        vardas,
        pavarde,
        e_pastas: ePastas,
        slapyvardis,
        slaptazodis,
        role: effectiveRole,
        miestas: effectiveRole === "privatus_pardavejas" ? miestas : null,
        tel_nr: effectiveRole === "privatus_pardavejas" ? telNr : null,
        svetaine: effectiveRole === "privatus_pardavejas" ? privatusSvetaine : null,
      };

      if (effectiveRole === "atstovas") {
        body.imone = {
          pavadinimas: imonePavadinimas,
          imones_kodas: imoneKodas,
          pvm_kodas: imonePvmKodas || null,
          miestas: imoneMiestas || null,
          adresas: imoneAdresas || null,
          pastato_nr: imonePastatoNr || null,
          pasto_kodas: imonePastoKodas || null,
          tel_nr: imoneTelNr || null,
          svetaine: imoneSvetaine || null,
        };
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registracijos klaida.");
        setLoading(false);
        return;
      }

      setLoading(false);

      // For sellers, show pending approval message
      if (effectiveRole === "atstovas" || effectiveRole === "privatus_pardavejas") {
        setError("Registracija sėkminga! Jūsų paskyra laukia administratoriaus patvirtinimo. Prisijungti galėsite po patvirtinimo.");
        return;
      }

      // For buyers, auto-login
      const loginResult = await signIn("credentials", {
        e_pastas: ePastas,
        slaptazodis,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Serverio klaida. Bandykite vėliau.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-green-200/40 blur-3xl dark:bg-green-900/20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Registracija
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sukurkite paskyrą ir prisijunkite prie miško sodinukų bendruomenės.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* ── ROLE TOGGLE (Main options) ── */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Paskyros tipas
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("vartotojas")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    role === "vartotojas"
                      ? "border-green-700 bg-green-700 text-white shadow-lg shadow-green-700/25 dark:border-green-400 dark:bg-green-400 dark:text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  🛒 Pirkėjas
                </button>
                <button
                  type="button"
                  onClick={() => setRole("atstovas")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    role === "atstovas"
                      ? "border-green-700 bg-green-700 text-white shadow-lg shadow-green-700/25 dark:border-green-400 dark:bg-green-400 dark:text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  🌲 Pardavėjas
                </button>
              </div>
            </div>

            {/* ── USER FIELDS ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="vardas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Vardas
                </label>
                <input id="vardas" type="text" required value={vardas} onChange={(e) => setVardas(e.target.value)} placeholder="Jonas" className={inputClass} />
              </div>
              <div>
                <label htmlFor="pavarde" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Pavardė
                </label>
                <input id="pavarde" type="text" required value={pavarde} onChange={(e) => setPavarde(e.target.value)} placeholder="Jonaitis" className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="slapyvardis" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Slapyvardis
              </label>
              <input id="slapyvardis" type="text" required value={slapyvardis} onChange={(e) => setSlapyvardis(e.target.value)} placeholder="jonas123" className={inputClass} />
            </div>

            <div>
              <label htmlFor="ePastas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                El. paštas
              </label>
              <input id="ePastas" type="email" required value={ePastas} onChange={(e) => setEPastas(e.target.value)} placeholder="jusu@pastas.lt" className={inputClass} />
            </div>

            <div>
              <label htmlFor="slaptazodis" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Slaptažodis
              </label>
              <input id="slaptazodis" type="password" required value={slaptazodis} onChange={(e) => setSlaptazodis(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>

            <div>
              <label htmlFor="confirmSlaptazodis" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Pakartokite slaptažodį
              </label>
              <input id="confirmSlaptazodis" type="password" required value={confirmSlaptazodis} onChange={(e) => setConfirmSlaptazodis(e.target.value)} placeholder="••••••••" className={inputClass} />
            </div>

            {/* ── SELLER TYPE TOGGLE & FIELDS ── */}
            {role === "atstovas" && (
              <div className="space-y-5 rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
                
                {/* Internal Slider for Seller Type */}
                <div className="flex rounded-xl bg-zinc-200/50 p-1 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`flex w-1/2 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                      isPrivate
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    👤 Privatus asmuo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`flex w-1/2 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                      !isPrivate
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    🏢 Įmonė
                  </button>
                </div>

                {isPrivate ? (
                  /* PRIVATE SELLER FIELDS */
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                      Parduokite kaip privatus asmuo be įmonės rekvizitų.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="miestas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Miestas <span className="text-red-500">*</span>
                        </label>
                        <input id="miestas" type="text" required value={miestas} onChange={(e) => setMiestas(e.target.value)} placeholder="Kaunas" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="telNr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Telefono nr. <span className="text-red-500">*</span>
                        </label>
                        <input id="telNr" type="tel" required value={telNr} onChange={(e) => setTelNr(e.target.value)} placeholder="+370 600 00000" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="privatusSvetaine" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Svetainė (Neprivaloma)
                      </label>
                      <input id="privatusSvetaine" type="text" value={privatusSvetaine} onChange={(e) => setPrivatusSvetaine(e.target.value)} placeholder="website.com" className={inputClass} />
                    </div>
                  </div>
                ) : (
                  /* COMPANY FIELDS */
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Parduokite kaip registruota įmonė.
                    </p>

                    <div>
                      <label htmlFor="imonePavadinimas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Įmonės pavadinimas <span className="text-red-500">*</span>
                      </label>
                      <input id="imonePavadinimas" type="text" required value={imonePavadinimas} onChange={(e) => setImonePavadinimas(e.target.value)} placeholder="UAB Žaliasis miškas" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="imoneKodas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Įmonės kodas <span className="text-red-500">*</span>
                        </label>
                        <input id="imoneKodas" type="text" required value={imoneKodas} onChange={(e) => setImoneKodas(e.target.value)} placeholder="123456789" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="imonePvmKodas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          PVM kodas
                        </label>
                        <input id="imonePvmKodas" type="text" value={imonePvmKodas} onChange={(e) => setImonePvmKodas(e.target.value)} placeholder="LT123456789" className={inputClass} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="imoneMiestas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Miestas
                        </label>
                        <input id="imoneMiestas" type="text" value={imoneMiestas} onChange={(e) => setImoneMiestas(e.target.value)} placeholder="Vilnius" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="imonePastoKodas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Pašto kodas
                        </label>
                        <input id="imonePastoKodas" type="text" value={imonePastoKodas} onChange={(e) => setImonePastoKodas(e.target.value)} placeholder="LT-01234" className={inputClass} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label htmlFor="imoneAdresas" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Adresas
                        </label>
                        <input id="imoneAdresas" type="text" value={imoneAdresas} onChange={(e) => setImoneAdresas(e.target.value)} placeholder="Miško g." className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="imonePastatoNr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Pastato nr.
                        </label>
                        <input id="imonePastatoNr" type="text" value={imonePastatoNr} onChange={(e) => setImonePastatoNr(e.target.value)} placeholder="15A" className={inputClass} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="imoneTelNr" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Telefono nr.
                        </label>
                        <input id="imoneTelNr" type="tel" value={imoneTelNr} onChange={(e) => setImoneTelNr(e.target.value)} placeholder="+370 600 12345" className={inputClass} />
                      </div>
                      <div>
                        <label htmlFor="imoneSvetaine" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          Svetainė (Neprivaloma)
                        </label>
                        <input id="imoneSvetaine" type="text" value={imoneSvetaine} onChange={(e) => setImoneSvetaine(e.target.value)} placeholder="website.com" className={inputClass} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-green-700 text-sm font-semibold text-white shadow-lg shadow-green-700/25 transition-all hover:bg-green-800 hover:shadow-xl hover:shadow-green-700/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Registruojama..." : "Registruotis"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Jau turite paskyrą?{" "}
          <Link
            href="/login"
            className="font-medium text-green-700 hover:underline dark:text-green-400"
          >
            Prisijungti
          </Link>
        </p>
      </div>
    </div>
  );
}