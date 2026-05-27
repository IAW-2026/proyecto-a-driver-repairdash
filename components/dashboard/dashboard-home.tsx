"use client";

import { useState } from "react";
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
};

export function DashboardHome({
  driver,
  stats,
  requests,
  trabajo,
}: DashboardHomeProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  

  return (
    <main className="min-h-screen overflow-x-hidden bg-primary text-highlight">
      <DriverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        driverName={driver.nombre}
        driverImageUrl={driver.imagenURL}
        rating={stats.ratingPromedio}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 sm:px-6 lg:px-8 lg:pb-10">
        <DashboardHeader
          driverName={driver.nombre}
          driverImageUrl={driver.imagenURL}
          onMenuClick={() => setIsDrawerOpen(true)}
        />

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-5">
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
            <div className="rounded-[30px] border border-highlight/10 bg-highlight/[0.05] p-6 shadow-2xl shadow-black/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    Trabajo activo
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-highlight">
                    {trabajo.tipoServicio.nombre}
                  </h3>
                  <p className="mt-3 text-sm text-highlight/60">{trabajo.direccion}</p>
                </div>
                <p className="text-2xl font-black text-highlight">
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

              <div className="mt-6 flex items-center justify-between">
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
                <a
                  href="/trabajos/activo"
                  className="rounded-2xl bg-gradient-to-r from-[#F500F1] to-[#d400d0] px-5 py-2 text-sm font-black text-white shadow-lg shadow-[#F500F1]/25 transition hover:opacity-90"
                >
                  Continuar trabajo
                </a>
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
