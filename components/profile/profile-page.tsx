"use client";

import { useState } from "react";
import Image from "next/image";
import { SignOutButton } from "@clerk/nextjs";
import { DriverDrawer } from "@/components/dashboard/driver-drawer";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { EditProfilePanel } from "@/components/profile/edit-profile-panel";
import type {
  DriverDashboardProfile,
  FeedbackReviewResponse,
  PaymentDailySummary,
  ServiceTypeDto,
} from "@/types/dashboard";

type ProfilePageProps = {
  driver: DriverDashboardProfile;
  feedback: FeedbackReviewResponse;
  payments: PaymentDailySummary;
  allServices: ServiceTypeDto[];
};

export function ProfilePage({
  driver,
  feedback,
  payments,
  allServices,
}: ProfilePageProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-primary text-highlight">
      <DriverDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {isEditOpen && (
        <EditProfilePanel
          driver={driver}
          allServices={allServices}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-20 pt-5 sm:px-6 lg:px-8">
        <DashboardHeader
          driverName={driver.nombre}
          notificationCount={0}
          onMenuClick={() => setIsDrawerOpen(true)}
        />

        <section className="mx-auto mt-8 w-full max-w-5xl">
          <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
            {/* LEFT SIDE */}
            <aside className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full border border-accent/20 bg-accent/10 shadow-xl shadow-accent/10">
                    {driver.imagenURL ? (
                      <Image
                        src={driver.imagenURL}
                        alt={driver.nombre}
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-highlight">
                        {driver.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <h1 className="mt-5 text-3xl font-bold">{driver.nombre}</h1>

                {driver.bio && (
                  <p className="mt-2 text-sm text-highlight/50 leading-relaxed px-2">
                    {driver.bio}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-highlight">
                    {driver.role}
                  </span>
                  <span
                    className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                      driver.status === "ONLINE"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : driver.status === "EN_TRABAJO"
                          ? "bg-yellow-500/15 text-yellow-300"
                          : "bg-zinc-500/15 text-zinc-300"
                    }`}
                  >
                    {driver.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-8 grid w-full grid-cols-3 gap-3">
                  <StatCard value={payments.trabajosLiquidados} label="Trabajos" />
                  <StatCard value={`★ ${feedback.valoracion}`} label="Rating" />
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
                  <InfoItem label="Nombre" value={driver.nombre} />
                  <InfoItem
                    label="Teléfono"
                    value={driver.telefono ?? "No configurado"}
                  />
                  <InfoItem label="Estado" value={driver.status} />
                  <InfoItem label="ID Driver" value={driver.id} />
                </div>
              </div>

              {/* Services */}
              <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Servicios habilitados
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {driver.servicios.length > 0 ? (
                    driver.servicios.map((service) => (
                      <span
                        key={service.id}
                        className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-highlight transition hover:scale-105"
                      >
                        {service.nombre}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-highlight/40">
                      No tenés servicios habilitados aún
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 shadow-2xl shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Cuenta
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="flex h-14 items-center justify-between rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 text-left font-semibold transition hover:border-accent/30 hover:bg-highlight/[0.08]"
                  >
                    Editar perfil
                    <span className="text-accent">›</span>
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

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.05] p-4 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-highlight/60">{label}</p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-highlight/45">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
