import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentDriverProfile } from "@/lib/services/driver.service";
import {
  getPaymentDailySummary,
  getPaymentMetrics,
} from "@/lib/services/external/payments.client";

async function retirarGanancias() {
  "use server";

  // TODO: reemplazar por URL real al integrar Payment App
  // const paymentAppUrl = process.env.PAYMENT_APP_URL ?? `${getBaseUrl()}/api/mocks/payments/withdraw`;
  // redirect(`${paymentAppUrl}/retirar`);

  redirect("/proximamente");
}

export default async function IngresosPage() {
  const driver =
  await getCurrentDriverProfile();

const payments =
  await getPaymentDailySummary(
    driver.id,
  );

  const {
    ingresosDelDia,
    balanceDisponible,
    trabajosLiquidados,
  } = getPaymentMetrics(
    payments,
  );

  return (
    <main className="min-h-screen bg-primary p-4 text-highlight sm:p-6">
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-highlight/65 transition hover:text-highlight"
      >
        ← Volver al inicio
      </Link>

      <div className="mx-auto mt-6 max-w-2xl sm:mt-8">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Ingresos
        </h1>

        <p className="mt-1 text-sm text-highlight/60 sm:mt-2 sm:text-base">
          Resumen de tus
          ganancias y pagos.
        </p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 md:grid-cols-2">
          {/* INGRESOS DEL DÍA */}
          <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:rounded-[28px] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
              Ingresos del día
            </p>

            <p className="mt-2 text-3xl font-bold text-accent sm:mt-3 sm:text-4xl">
              $
              {ingresosDelDia.toLocaleString(
                "es-AR",
              )}
            </p>
          </div>

          {/* TRABAJOS LIQUIDADOS */}
          <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:rounded-[28px] sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
              Trabajos liquidados
            </p>

            <p className="mt-2 text-3xl font-bold text-highlight sm:mt-3 sm:text-4xl">
              {
                trabajosLiquidados
              }
            </p>
          </div>
        </div>

        {/* BALANCE DISPONIBLE */}
        <div className="mt-4 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:mt-6 sm:rounded-[28px] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
            Balance disponible para retirar
          </p>

          <p className="mt-2 text-3xl font-bold text-accent sm:mt-3 sm:text-4xl">
            $
            {balanceDisponible.toLocaleString(
              "es-AR",
            )}
          </p>
        </div>

        <form
          action={retirarGanancias}
          className="mt-4 sm:mt-6"
        >
          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-magenta px-6 text-sm font-bold text-white shadow-lg shadow-magenta/25 transition hover:opacity-90"
          >
            Retirar dinero
          </button>
        </form>
      </div>
    </main>
  );
}
