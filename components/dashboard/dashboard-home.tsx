"use client";

import { useState } from "react";
import type {
  DashboardJobRequest,
  DriverAvailability,
  DriverDailyStats,
  DriverDashboardProfile,
} from "@/types/dashboard";
import { DashboardHeader } from "./dashboard-header";
import { DriverDrawer } from "./driver-drawer";
import { DriverStatusCard } from "./driver-status-card";
import { JobRequestsCarousel } from "./job-requests-carousel";
import { StatsGrid } from "./stats-grid";

type DashboardHomeProps = {
  driver: DriverDashboardProfile;
  stats: DriverDailyStats;
  requests: DashboardJobRequest[];
};

export function DashboardHome({ driver, stats, requests }: DashboardHomeProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [status, setStatus] = useState<DriverAvailability>(driver.status);

  return (
    <main className="min-h-screen overflow-hidden bg-primary text-highlight">
      <DriverDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
        <DashboardHeader
          driverName={driver.nombre}
          onMenuClick={() => setIsDrawerOpen(true)}
          notificationCount={3}
        />

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-5">
            <DriverStatusCard
              status={status}
              offeredServices={driver.servicios.map((service) => service.nombre)}
              onToggle={() => setStatus((current) => (current === "ONLINE" ? "OFFLINE" : "ONLINE"))}
            />
            <StatsGrid stats={stats} />
          </section>

          <aside className="hidden rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Operacion</p>
            <h2 className="mt-3 text-2xl font-bold text-highlight">Resumen activo</h2>
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

        <JobRequestsCarousel requests={requests} />
      </div>
    </main>
  );
}
