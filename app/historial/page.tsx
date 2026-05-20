import Link from "next/link";
import { getCurrentDriverProfile } from "@/lib/services/driver.service";

export default async function TrabajosPage() {
  const driver = await getCurrentDriverProfile();

  return (
    <main className="min-h-screen bg-primary p-4 text-highlight sm:p-6">
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-highlight/65 transition hover:text-highlight"
      >
        ← Volver al inicio
      </Link>

      <div className="mx-auto mt-6 max-w-2xl sm:mt-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Trabajos</h1>
        <p className="mt-1 text-sm text-highlight/60 sm:mt-2 sm:text-base">
          Historial de trabajos realizados y en curso.
        </p>

        <div className="mt-6 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-4 shadow-2xl shadow-black/20 sm:mt-8 sm:rounded-[28px] sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-highlight/[0.06] text-base sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
              🛠️
            </span>
            <div>
              <p className="text-sm font-semibold text-highlight sm:text-base">
                {driver.nombre}
              </p>
              <p className="mt-0.5 text-xs text-highlight/55 sm:mt-1 sm:text-sm">
                No hay trabajos registrados aún
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-4 shadow-2xl shadow-black/20 sm:mt-6 sm:rounded-[28px] sm:p-6">
          <p className="text-xs leading-5 text-highlight/60 sm:text-sm sm:leading-6">
            El historial completo estará disponible cuando el servicio externo esté integrado.
          </p>
        </div>
      </div>
    </main>
  );
}
