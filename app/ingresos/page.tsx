import Link from "next/link";
import { getCurrentDriverProfile } from "@/lib/services/driver.service";
import { getPaymentDailySummary } from "@/lib/services/external/payments.client";

export default async function IngresosPage() {
  const driver = await getCurrentDriverProfile();
  const payments = await getPaymentDailySummary(driver.id);

  return (
    <main className="min-h-screen bg-primary p-4 text-highlight sm:p-6">
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-highlight/65 transition hover:text-highlight"
      >
        ← Volver al inicio
      </Link>

      <div className="mx-auto mt-6 max-w-2xl sm:mt-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Ingresos</h1>
        <p className="mt-1 text-sm text-highlight/60 sm:mt-2 sm:text-base">
          Resumen de tus ganancias y pagos.
        </p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:rounded-[28px] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
              Ingresos del día
            </p>
            <p className="mt-2 text-3xl font-bold text-accent sm:mt-3 sm:text-4xl">
              ${(payments.ingresosDelDia).toLocaleString("es-AR")}
            </p>
          </div>

          <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:rounded-[28px] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
              Trabajos liquidados
            </p>
            <p className="mt-2 text-3xl font-bold text-highlight sm:mt-3 sm:text-4xl">
              {payments.trabajosLiquidados}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-4 shadow-2xl shadow-black/20 sm:mt-6 sm:rounded-[28px] sm:p-6">
          <p className="text-xs leading-5 text-highlight/60 sm:text-sm sm:leading-6">
            Esta sección conectará con Payments App cuando el servicio externo esté disponible.
          </p>
        </div>
      </div>
    </main>
  );
}
