"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [ePastas, setEPastas] = useState("");
  const [slaptazodis, setSlaptazodis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      e_pastas: ePastas,
      slaptazodis,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Neteisingas el. paštas arba slaptažodis.");
    } else {
      // Get the updated session
      const session = await getSession();
      if (session?.user && (session.user as any).role === "administratorius") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 dark:bg-zinc-950">
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
            Prisijungimas
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Įveskite savo duomenis, kad prisijungtumėte prie paskyros.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="ePastas"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                El. paštas
              </label>
              <input
                id="ePastas"
                type="email"
                required
                value={ePastas}
                onChange={(e) => setEPastas(e.target.value)}
                placeholder="jusu@pastas.lt"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
              />
            </div>

            <div>
              <label
                htmlFor="slaptazodis"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Slaptažodis
              </label>
              <input
                id="slaptazodis"
                type="password"
                required
                value={slaptazodis}
                onChange={(e) => setSlaptazodis(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-green-700 focus:ring-1 focus:ring-green-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-green-400 dark:focus:ring-green-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-green-700 text-sm font-semibold text-white shadow-lg shadow-green-700/25 transition-all hover:bg-green-800 hover:shadow-xl hover:shadow-green-700/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Jungiamasi..." : "Prisijungti"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Neturite paskyros?{" "}
          <Link
            href="/register"
            className="font-medium text-green-700 hover:underline dark:text-green-400"
          >
            Registruotis
          </Link>
        </p>
      </div>
    </div>
  );
}