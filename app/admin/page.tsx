"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "administratorius") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || (session.user as any).role !== "administratorius") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-green-50/40 dark:from-zinc-950 dark:via-zinc-950 dark:to-green-950/20">
      <Navbar />
      <div className="pt-32 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16">
            <h1 className="mb-3 text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100">
              Administratoriaus panelė
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">Valdykite sistemą, vartotojus ir skelbimus iš vienos vietos.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Link href="/admin/users">
              <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 cursor-pointer h-full shadow-sm hover:shadow-2xl hover:-translate-y-1">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-100/0 group-hover:from-green-50/50 group-hover:to-green-50/20 dark:group-hover:from-green-900/10 dark:group-hover:to-green-900/5 transition-all duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                        Vartotojų valdymas
                      </h2>
                    </div>
                    <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">👥</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-8 line-clamp-2">
                    Peržiūrėti ir valdyti sistemos vartotojus, patvirtinti naujas registracijas.
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:shadow-green-600/40 transition-all duration-300 group-hover:gap-3">
                    Valdyti vartotojus
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/skelbimai">
              <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 cursor-pointer h-full shadow-sm hover:shadow-2xl hover:-translate-y-1">
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-100/0 group-hover:from-green-50/50 group-hover:to-green-50/20 dark:group-hover:from-green-900/10 dark:group-hover:to-green-900/5 transition-all duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                        Skelbimų valdymas
                      </h2>
                    </div>
                    <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">📋</span>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-8 line-clamp-2">
                    Peržiūrėti, redaguoti ir moderuoti visus skelbimus sistemoje.
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:shadow-green-600/40 transition-all duration-300 group-hover:gap-3">
                    Valdyti skelbimus
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}