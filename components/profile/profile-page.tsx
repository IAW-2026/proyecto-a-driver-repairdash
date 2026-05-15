"use client";

import {
  ShieldCheck,
  UserRound,
  ChevronRight,
} from "lucide-react";
import { EditableField } from "./editable-field";
import { EditableServices } from "./editable-services";
import { EditableAvatar } from "./editable-avatar";
import { EditablePhoneField } from "./editable-phone-field";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DriverDrawer } from "@/components/dashboard/driver-drawer";
import { AccountSidebar } from "./account-sidebar";
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
  allServices,
  payments,
}: ProfilePageProps) {
  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const { openUserProfile } =
  useClerk();

  const [activeSection, setActiveSection] =
  useState<
    "resumen" | "informacion" | "seguridad"
  >("resumen");

  return (
    <main className="min-h-screen bg-primary text-highlight">
      <DriverDrawer
        isOpen={isDrawerOpen}
        onClose={() =>
          setIsDrawerOpen(false)
        }
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-5 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-highlight/65 transition hover:text-highlight"
        >
          ← Volver al inicio
        </Link>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row">
          <AccountSidebar
            activeSection={activeSection}
            onChange={setActiveSection}
          />

          <section className="min-w-0 flex-1 rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-4 shadow-2xl shadow-black/20 sm:p-6 lg:rounded-[32px] lg:p-8">
            {/* Header Uber */}
            <div className="flex flex-col items-center">
              <EditableAvatar
                imageUrl={
                  driver.imagenURL
                }
                name={
                  driver.nombre
                }
              />

              <h1 className="mt-5 text-4xl font-bold text-highlight">
                {driver.nombre}
              </h1>

              <p className="mt-2 text-highlight/65">
                {driver.email}
              </p>

              <div className="mt-8 flex w-full justify-center">
                <div className="grid w-full max-w-2xl gap-4 md:grid-cols-2">
                  <QuickCard
                    title="Información personal"
                    icon={
                      <UserRound className="h-5 w-5" />
                    }
                    onClick={() =>
                      setActiveSection(
                        "informacion",
                      )
                    }
                    active={
                      activeSection ===
                      "informacion"
                    }
                  />

                  <QuickCard
                    title="Seguridad"
                    icon={
                      <ShieldCheck className="h-5 w-5" />
                    }
                    onClick={() =>
                      setActiveSection(
                        "seguridad",
                      )
                    }
                    active={
                      activeSection ===
                      "seguridad"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Content */}
            <div className="mt-10">
              {activeSection ===
                "resumen" && (
                <div className="space-y-6">
                </div>
              )}

              {activeSection === "informacion" && (
                <SectionCard title="Información personal">
                  <div className="space-y-4">

                    <EditableField
                      label="Nombre"
                      field="nombre"
                      value={driver.nombre}
                    />

                    <div className="rounded-3xl border border-highlight/10 bg-highlight/[0.03] p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs uppercase tracking-[0.2em] text-highlight/40">
                            Email
                          </p>

                          <p className="mt-2 overflow-hidden text-sm font-medium leading-6 text-highlight break-words sm:text-base">
                            {driver.email}
                          </p>

                          <p className="mt-2 text-sm text-highlight/45">
                            Gestionado por Clerk
                          </p>
                        </div>

                        <span className="shrink-0 self-start rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent sm:px-3 sm:text-xs">
                          Solo lectura
                        </span>
                      </div>
                    </div>

                    <EditablePhoneField
                      value={
                        driver.telefono
                      }
                    />

                    <EditableField
                      label="Bio"
                      field="bio"
                      value={driver.bio}
                      multiline
                    />

                    <InfoRow
                      label="Estado"
                      value={driver.status}
                    />

                    <div className="rounded-3xl border border-highlight/10 bg-highlight/[0.03] p-5">
                      <EditableServices
                        currentServices={
                          driver.servicios
                        }
                        allServices={
                          allServices
                        }
                      />
                    </div>
                  </div>
                </SectionCard>
              )}

              {activeSection ===
                "seguridad" && (
                <SectionCard title="Seguridad">
                  <div className="space-y-4">
                    <SecurityCard
                      title="Cambiar contraseña"
                      description="Actualiza tu contraseña de acceso."
                      onClick={() =>
                        openUserProfile()
                      }
                    />

                    <SecurityCard
                      title="Gestionar email"
                      description="Modificar tu dirección de correo."
                      onClick={() =>
                        openUserProfile()
                      }
                    />
                  </div>
                </SectionCard>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function QuickCard({
  title,
  icon,
  onClick,
  active,
}: {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={
        onClick
      }
      className={`group rounded-[28px] border p-6 text-left transition ${
        active
          ? "border-accent/40 bg-accent/10"
          : "border-highlight/10 bg-highlight/[0.03] hover:border-highlight/20 hover:bg-highlight/[0.06]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              active
                ? "bg-accent text-primary"
                : "bg-highlight/[0.06] text-highlight"
            }`}
          >
            {icon}
          </div>

          <p className="font-semibold text-highlight">
            {title}
          </p>
        </div>

        <ChevronRight
          className={`h-5 w-5 transition ${
            active
              ? "text-accent"
              : "text-highlight/40 group-hover:translate-x-1"
          }`}
        />
      </div>
    </button>
  );
}

function SectionCard({
  title,
  children,
}: React.PropsWithChildren<{
  title: string;
}>) {
  return (
    <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.03] p-6">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <div className="mt-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-highlight/40">
        {label}
      </p>

      <p className="mt-2 font-medium">
        {value}
      </p>
    </div>
  );
}

function SecurityCard({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={
        onClick
      }
      className="group flex w-full items-center justify-between rounded-[28px] border border-highlight/10 bg-highlight/[0.03] p-5 text-left transition hover:border-highlight/20 hover:bg-highlight/[0.06]"
    >
      <div>
        <h3 className="font-semibold text-highlight">
          {title}
        </h3>

        <p className="mt-1 text-sm text-highlight/55">
          {description}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 text-highlight/40 transition group-hover:translate-x-1" />
    </button>
  );
}