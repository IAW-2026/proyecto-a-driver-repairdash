"use client";

import Link from "next/link";
import {
  Home,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-primary px-5 py-6 text-highlight">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(245,0,241,0.14),transparent_34%),linear-gradient(180deg,rgba(39,16,51,0.98),#271033_58%,#32143f)]" />

      <section className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
        <div className="grid size-16 place-items-center rounded-[24px] border border-red-300/15 bg-red-300/[0.07] shadow-2xl shadow-black/25">
          <TriangleAlert
            aria-hidden
            className="size-7 text-red-200"
            strokeWidth={2.2}
          />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-red-200/80">
          Error
        </p>

        <h1 className="mt-3 text-3xl font-black leading-tight text-highlight sm:text-4xl">
          Algo no salio como esperabamos
        </h1>

        <p className="mt-4 max-w-sm text-sm leading-6 text-highlight/58">
          No pudimos cargar esta vista. Podes reintentar sin perder la sesion o
          volver al dashboard.
        </p>

        {error.digest && (
          <p className="mt-4 rounded-full border border-highlight/10 bg-highlight/[0.04] px-3 py-1 text-[11px] font-semibold text-highlight/45">
            Codigo: {error.digest}
          </p>
        )}

        <div className="mt-9 grid w-full gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-magenta px-5 text-sm font-black text-white shadow-xl shadow-magenta/25 transition hover:bg-magenta/90"
          >
            <RefreshCcw
              aria-hidden
              className="size-4"
            />
            Reintentar
          </button>

          <Link
            href="/"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-highlight/12 bg-highlight/[0.05] px-5 text-sm font-black text-highlight shadow-xl shadow-black/10 transition hover:bg-highlight/[0.08]"
          >
            <Home
              aria-hidden
              className="size-4"
            />
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
