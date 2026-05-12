"use client";

import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { DriverDrawer } from "@/components/dashboard/driver-drawer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type {
  DriverDashboardProfile,
  FeedbackReviewResponse,
  PaymentDailySummary,
} from "@/types/dashboard";

type ProfilePageProps = {
  driver: DriverDashboardProfile;
  feedback: FeedbackReviewResponse;
  payments: PaymentDailySummary;
};

export function ProfilePage({
  driver,
  feedback,
  payments,
}: ProfilePageProps) {
  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-primary text-highlight">
      <DriverDrawer
        isOpen={isDrawerOpen}
        onClose={() =>
          setIsDrawerOpen(false)
        }
      />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <DashboardHeader
          driverName={driver.nombre}
          notificationCount={0}
          onMenuClick={() =>
            setIsDrawerOpen(true)
          }
        />

        <section className="mx-auto mt-8 w-full max-w-5xl">
          <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* LEFT SIDE */}
            <aside className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col items-center text-center">
                <div className="grid h-28 w-28 place-items-center rounded-full border border-accent/20 bg-accent/10 text-4xl font-bold text-highlight shadow-xl shadow-accent/10">
                  {driver.nombre
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h1 className="mt-5 text-3xl font-bold">
                  {driver.nombre}
                </h1>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-highlight">
                    {driver.role}
                  </span>

                  <span
                    className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                      driver.status ===
                      "ONLINE"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : driver.status ===
                            "EN_TRABAJO"
                          ? "bg-yellow-500/15 text-yellow-300"
                          : "bg-zinc-500/15 text-zinc-300"
                    }`}
                  >
                    {driver.status.replace(
                      "_",
                      " ",
                    )}
                  </span>
                </div>

                <div className="mt-8 grid w-full grid-cols-3 gap-3">
                  <StatCard
                    value={
                      payments.trabajosLiquidados
                    }
                    label="Trabajos"
                  />
                  <StatCard
                    value={`★ ${feedback.valoracion}`}
                    label="Rating"
                  />
                  <StatCard
                    value={`$${payments.ingresosDelDia.toLocaleString()}`}
                    label="Hoy"
                  />
                </div>
              </div>
            </aside>

            {/* RIGHT SIDE */}
            <section className="space-y-5">
              {/* Personal Info */}
              <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Información personal
                </p>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    label="Nombre"
                    value={driver.nombre}
                  />
                  <InfoItem
                    label="Email"
                    value={
                      "Configurado desde Clerk"
                    }
                  />
                  <InfoItem
                    label="Estado"
                    value={driver.status}
                  />
                  <InfoItem
                    label="ID Driver"
                    value={driver.id}
                  />
                </div>
              </div>

              {/* Services */}
              <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Servicios habilitados
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {driver.servicios.map(
                    (service) => (
                      <span
                        key={service.id}
                        className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-highlight transition hover:scale-105"
                      >
                        {
                          service.nombre
                        }
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Cuenta
                </p>

                <div className="mt-5 flex flex-col gap-3">
                  <button className="flex h-14 items-center justify-between rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 text-left font-semibold transition hover:border-accent/30 hover:bg-highlight/[0.08]">
                    Editar perfil
                    <span className="text-accent">
                      ›
                    </span>
                  </button>

                  <SignOutButton>
                    <button className="flex h-14 items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/10 px-5 text-left font-semibold text-red-300 transition hover:bg-red-500/15">
                      Cerrar sesión
                      <span>↗</span>
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.05] p-4 text-center">
      <p className="text-lg font-bold">
        {value}
      </p>
      <p className="text-xs text-highlight/60">
        {label}
      </p>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-highlight/45">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}