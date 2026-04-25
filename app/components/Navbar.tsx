"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-green-700 dark:text-green-400"
        >
          <span className="text-2xl">🌲</span>
          Dievų Giria
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium hover:text-green-700 transition-colors">
            Funkcijos
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-green-700 transition-colors">
            Kaip veikia
          </a>
          <Link href="/skelbimas" className="text-sm font-medium hover:text-green-700 transition-colors">
            Turgavietė
          </Link>
          <Link href="/planavimas" className="text-sm font-medium hover:text-green-700 transition-colors">
            Planavimas
          </Link>
        </div>

        {/* Replaced + Skelbimas with Mano skelbimai */}
        {session?.user && (session.user as any).role === "atstovas" && (
          <div className="flex items-center gap-2">
            <Link
              href="/mano-skelbimai"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
            >
              Mano skelbimai
            </Link>
            <Link
              href="/skelbimas/kurti"
              className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 hover:scale-105 active:scale-95"
            >
              <span className="group-hover:scale-110 transition-transform">✏️</span>
              Kurti skelbimus
            </Link>
          </div>
        )}

        {/* Admin panel link for administrators */}
        {session?.user && (session.user as any).role === "administratorius" && (
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-sm font-semibold text-white hover:from-orange-700 hover:to-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-orange-600/30 hover:scale-105 active:scale-95"
            >
              <span className="group-hover:scale-110 transition-transform">⚙️</span>
              Admin panelė
            </Link>
            <Link
              href="/skelbimas/kurti"
              className="group relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-sm font-semibold text-white hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 hover:scale-105 active:scale-95"
            >
              <span className="group-hover:scale-110 transition-transform">✏️</span>
              Kurti skelbimus
            </Link>
          </div>
        )}

        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : session ? (
            <>
              <Link
                href="/profilis"
                className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-green-700 transition-colors"
              >
                <span className="text-lg">👤</span>
                Profilis
              </Link>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Sveiki, <span className="font-medium text-zinc-900 dark:text-zinc-100">{session.user?.name}</span>
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Atsijungti
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Prisijungti
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
              >
                Registruotis
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}