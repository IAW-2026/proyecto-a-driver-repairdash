"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  DashboardJobRequest,
  DriverDailyStats,
  DriverDashboardProfile,
} from "@/types/dashboard";
import { DashboardHeader } from "./dashboard-header";
import { DriverDrawer } from "./driver-drawer";
import { DriverStatusCard } from "./driver-status-card";
import { JobRequestsCarousel } from "./job-requests-carousel";
import { StatsGrid } from "./stats-grid";
import { formatCurrency } from "@/lib/utils/format";
import { AutoRefresh } from "@/components/auto-refresh";

import type { Trabajo, TipoServicio } from "@prisma/client";



// 🔑 DTO para normalizar Decimal → number
export type TrabajoDto = Omit<Trabajo, "montoEstimado"> & {
  montoEstimado: number;
  tipoServicio: Omit<TipoServicio, "precioBase"> & { precioBase: number };
};

type DashboardHomeProps = {
  driver: DriverDashboardProfile;
  stats: DriverDailyStats;
  requests: DashboardJobRequest[];
  trabajo?: TrabajoDto;
  trabajoCancelado?: TrabajoDto;
};

export function DashboardHome({
  driver,
  stats,
  requests,
  trabajo,
  trabajoCancelado,
}: DashboardHomeProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [
    dismissedCancelId,
    setDismissedCancelId,
  ] = useState<string | null>(null);
  const [
    isHydrated,
    setIsHydrated,
  ] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setIsHydrated(true),
      0,
    );

    return () => window.clearTimeout(timeoutId);
  }, []);

  const cancelStorageKey =
    trabajoCancelado
      ? `repairdash:cancelled-work:${trabajoCancelado.id}`
      : null;

  const wasCancelSeen =
    isHydrated &&
    cancelStorageKey
      ? window.localStorage.getItem(cancelStorageKey) === "seen"
      : true;

  const showCancelModal =
    Boolean(
      isHydrated &&
        trabajoCancelado &&
        dismissedCancelId !== trabajoCancelado.id &&
        !wasCancelSeen,
    );

  function closeCancelModal() {
    if (
      trabajoCancelado &&
      cancelStorageKey
    ) {
      window.localStorage.setItem(
        cancelStorageKey,
        "seen",
      );

      setDismissedCancelId(
        trabajoCancelado.id,
      );
    }
  }

  

  return (
    <main className="min-h-screen overflow-x-hidden bg-primary text-highlight">
      <AutoRefresh />

      <DriverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        driverName={driver.nombre}
        driverImageUrl={driver.imagenURL}
        rating={stats.ratingPromedio}
      />

      {showCancelModal && trabajoCancelado ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#09020d]/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] border border-highlight/10 bg-[#2b1038]/95 p-6 text-center shadow-2xl shadow-magenta/20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Trabajo cancelado
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-highlight">
              Ups... el cliente canceló el trabajo
            </h2>

            <p className="mt-3 text-sm leading-6 text-highlight/62">
              {trabajoCancelado.tipoServicio.nombre} ya no está disponible. Te
              dejamos nuevamente online para recibir nuevas solicitudes.
            </p>

            <button
              type="button"
              onClick={closeCancelModal}
              className="mt-7 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-magenta px-6 text-sm font-black text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <DashboardHeader
          driverName={driver.nombre}
          driverImageUrl={driver.imagenURL}
          onMenuClick={() => setIsDrawerOpen(true)}
        />

        <div className="mt-5 grid gap-4 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-4 sm:space-y-5">
            <DriverStatusCard
              status={driver.status}
              offeredServices={driver.servicios.map((service) => service.nombre)}
            />

            <StatsGrid stats={stats} />
          </section>

          <aside className="hidden rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Operación
            </p>

            <h2 className="mt-3 text-2xl font-bold text-highlight">
              Resumen activo
            </h2>

            <div className="mt-6 space-y-4 text-sm text-highlight/72">
              <p>Servicios habilitados para recibir solicitudes compatibles:</p>

              <div className="flex flex-wrap gap-2">
                {driver.servicios.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold text-highlight"
                  >
                    {service.nombre}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {driver.status === "EN_TRABAJO" && trabajo ? (
          <section className="mt-7">
            <div className="rounded-[26px] border border-highlight/10 bg-highlight/[0.05] p-4 shadow-2xl shadow-black/20 sm:rounded-[30px] sm:p-6">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    Trabajo activo
                  </p>
                  <h3 className="mt-2 truncate text-2xl font-black leading-tight text-highlight sm:text-3xl">
                    {trabajo.tipoServicio.nombre}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-highlight/60 sm:mt-3 sm:text-sm">{trabajo.direccion}</p>
                </div>
                <p className="text-left text-xl font-black leading-none text-highlight sm:shrink-0 sm:text-right sm:text-2xl">
                  {formatCurrency(trabajo.montoEstimado)}
                </p>
              </div>

              {trabajo.descripcion && (
                <div className="mt-6 rounded-2xl border border-highlight/10 bg-primary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-highlight/40">
                    Descripción
                  </p>
                  <p className="mt-2 text-sm leading-6 text-highlight/75">{trabajo.descripcion}</p>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:mt-6 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-highlight/40">
                      Estado actual
                    </p>

                    <div
                      role="status"
                      className="mt-1 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#F500F1]/8 to-[#D400D0]/8 px-3 py-1 text-sm font-semibold text-[#F500F1]"
                    >
                      <span
                        aria-hidden
                        className={
                          "h-2 w-2 rounded-full " +
                          (trabajo.estado === "FINALIZADO"
                            ? "bg-emerald-400"
                            : trabajo.estado === "EN_SERVICIO"
                            ? "bg-yellow-400"
                            : trabajo.estado === "EN_CAMINO"
                            ? "bg-blue-400"
                            : trabajo.estado === "ACEPTADO"
                            ? "bg-[#F500F1]"
                            : "bg-gray-400")
                        }
                      />

                      <span className="uppercase tracking-wider">
                        {String(trabajo.estado).replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/trabajos/activo"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#F500F1] to-[#d400d0] px-5 text-sm font-black text-white shadow-lg shadow-[#F500F1]/25 transition hover:opacity-90 sm:w-auto"
                >
                  Continuar trabajo
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <JobRequestsCarousel requests={requests} driverStatus={driver.status} />
        )}
      </div>
    </main>
  );
}
