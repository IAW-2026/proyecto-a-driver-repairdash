import Link from "next/link";
import {
  Home,
  SearchX,
} from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-primary px-5 py-6 text-highlight">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(245,0,241,0.14),transparent_34%),linear-gradient(180deg,rgba(39,16,51,0.98),#271033_58%,#32143f)]" />

      <section className="relative mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
        <div className="grid size-16 place-items-center rounded-[24px] border border-highlight/10 bg-highlight/[0.05] shadow-2xl shadow-black/25">
          <SearchX
            aria-hidden
            className="size-7 text-magenta"
            strokeWidth={2.2}
          />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-magenta/80">
          404
        </p>

        <h1 className="mt-3 text-3xl font-black leading-tight text-highlight sm:text-4xl">
          No encontramos esta pantalla
        </h1>

        <p className="mt-4 max-w-sm text-sm leading-6 text-highlight/58">
          El enlace puede haber cambiado, o la vista que estas buscando no
          existe dentro de DriverApp.
        </p>

        <div className="mt-9 w-full">
          <Link
            href="/"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-magenta px-5 text-sm font-black text-white shadow-xl shadow-magenta/25 transition hover:bg-magenta/90"
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
