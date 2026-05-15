"use client";

export default function CuentaError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary p-6 text-center text-highlight">
      <div className="rounded-[32px] border border-highlight/10 bg-highlight/[0.04] p-8 shadow-2xl shadow-black/20">
        <span className="text-4xl">⚠️</span>

        <h1 className="mt-4 text-2xl font-bold">
          Error al cargar la cuenta
        </h1>

        <p className="mt-2 text-highlight/60">
          Ocurrió un error inesperado. Intentá de nuevo.
        </p>

        <button
          onClick={reset}
          className="mt-6 rounded-2xl bg-magenta px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
