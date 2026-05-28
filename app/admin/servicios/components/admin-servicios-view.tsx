"use client";

import { useUser } from "@clerk/nextjs";
import { Menu, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

import { AdminSecurityDrawer } from "./admin-security-drawer";
import { CreateServiceModal } from "./create-service-modal";
import { ServiceEditor } from "./service-editor";
import { ServiceSidebar } from "./service-sidebar";
import { StatsCards } from "./stats-cards";

type AdminServiciosViewProps = {
  services: AdminServiceType[];
};

function sortServices(services: AdminServiceType[]) {
  return [...services].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es", {
      sensitivity: "base",
    }),
  );
}

export function AdminServiciosView({ services }: AdminServiciosViewProps) {
  const { user } = useUser();
  const [localServices, setLocalServices] = useState(() => sortServices(services));
  const [selectedServiceId, setSelectedServiceId] = useState(
    localServices[0]?.id,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const adminName =
    user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "Admin";

  const selectedService = useMemo(
    () =>
      localServices.find((service) => service.id === selectedServiceId) ??
      localServices[0],
    [localServices, selectedServiceId],
  );

  function handleCreated(service: AdminServiceType) {
    setLocalServices((currentServices) => sortServices([...currentServices, service]));
    setSelectedServiceId(service.id);
    setCreateModalOpen(false);
    setStatusMessage("Servicio creado y seleccionado.");
  }

  function handleUpdated(updatedService: AdminServiceType) {
    setLocalServices((currentServices) =>
      sortServices(
        currentServices.map((service) =>
          service.id === updatedService.id ? updatedService : service,
        ),
      ),
    );
    setSelectedServiceId(updatedService.id);
  }

  function handleDeleted(serviceId: string) {
    const nextServices = localServices.filter((service) => service.id !== serviceId);

    setLocalServices(nextServices);
    setSelectedServiceId(nextServices[0]?.id);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-primary text-highlight">
      <AdminSecurityDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        adminName={adminName}
        adminImageUrl={user?.imageUrl}
      />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,0,241,0.16),transparent_34%),radial-gradient(circle_at_20%_15%,rgba(195,146,221,0.10),transparent_28%)]" />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex flex-col gap-5 rounded-[32px] border border-highlight/10 bg-highlight/[0.035] p-5 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Abrir menu de seguridad"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-highlight shadow-lg shadow-black/20 transition hover:border-magenta/35 hover:bg-highlight/[0.09]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-magenta">
                Admin
              </p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-highlight sm:text-5xl">
                Tipos de trabajo
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-highlight/58 sm:text-base">
                Gestioná los servicios disponibles para la operación de
                RepairDash.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[24px] bg-magenta px-6 text-sm font-black text-white shadow-xl shadow-magenta/25 transition hover:-translate-y-0.5 hover:bg-magenta/90 sm:w-auto sm:min-w-52"
          >
            <Plus className="h-5 w-5" />
            Nuevo servicio
          </button>
        </header>

        <StatsCards services={localServices} />

        {statusMessage && (
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="rounded-[22px] border border-magenta/20 bg-magenta/[0.08] px-4 py-3 text-left text-sm font-semibold text-highlight shadow-lg shadow-magenta/5 transition hover:bg-magenta/[0.12]"
          >
            {statusMessage}
          </button>
        )}

        <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[410px_minmax(0,1fr)]">
          <ServiceSidebar
            services={localServices}
            selectedServiceId={selectedService?.id}
            onSelectService={setSelectedServiceId}
          />

          <ServiceEditor
            key={selectedService?.id ?? "empty-service-editor"}
            service={selectedService}
            onDelete={handleDeleted}
            onUpdate={handleUpdated}
            onStatusChange={setStatusMessage}
          />
        </div>
      </div>

      <CreateServiceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </main>
  );
}
