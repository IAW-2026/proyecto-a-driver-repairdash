"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

import { ServiceListItem } from "./service-list-item";

type ServiceSidebarProps = {
  services: AdminServiceType[];
  selectedServiceId?: string;
  onSelectService: (serviceId: string) => void;
};

export function ServiceSidebar({
  services,
  selectedServiceId,
  onSelectService,
}: ServiceSidebarProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return services;
    }

    return services.filter((service) =>
      `${service.nombre} ${service.descripcion}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, services]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredServices.length /
        itemsPerPage,
    ),
  );
  const currentPage = Math.min(
    page,
    totalPages,
  );

  const paginatedServices =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        itemsPerPage;

      return filteredServices.slice(
        start,
        start + itemsPerPage,
      );
    }, [
      filteredServices,
      currentPage,
    ]);

  const hasResults =
    filteredServices.length > 0;

  return (
    <aside className="flex flex-col rounded-[32px] border border-highlight/10 bg-highlight/[0.035] p-4 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-5 lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight/40">
            Servicios
          </p>
          <h2 className="mt-1 text-2xl font-black text-highlight">
            {services.length}
          </h2>
        </div>
      </div>

      <label className="mt-5 flex h-12 items-center gap-3 rounded-[22px] border border-highlight/10 bg-primary/45 px-4 text-highlight/50 transition focus-within:border-magenta/50 focus-within:text-highlight">
        <Search className="h-4 w-4 shrink-0" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Buscar servicio"
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-highlight outline-none placeholder:text-highlight/30"
        />
      </label>

      <div className="mt-5 space-y-3">
        {paginatedServices.map((service) => (
          <ServiceListItem
            key={service.id}
            service={service}
            selected={service.id === selectedServiceId}
            onSelect={onSelectService}
          />
        ))}

        {!hasResults && (
          <div className="rounded-[26px] border border-dashed border-highlight/15 bg-primary/25 p-6 text-center">
            <p className="text-sm font-bold text-highlight">Sin resultados</p>
            <p className="mt-2 text-sm leading-6 text-highlight/50">
              Probá con otro nombre o descripción.
            </p>
          </div>
        )}
      </div>

      {hasResults && (
        <div className="mt-5 flex items-center justify-between gap-3 rounded-[24px] border border-highlight/10 bg-primary/35 p-2">
          <button
            type="button"
            onClick={() =>
              setPage((currentPage) =>
                Math.max(
                  1,
                  currentPage - 1,
                ),
              )
            }
            disabled={currentPage === 1}
            className="grid h-10 w-10 place-items-center rounded-[18px] border border-highlight/10 bg-highlight/[0.06] text-highlight transition hover:bg-highlight/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <p className="text-xs font-black uppercase tracking-[0.16em] text-highlight/55">
            {currentPage} / {totalPages}
          </p>

          <button
            type="button"
            onClick={() =>
              setPage((currentPage) =>
                Math.min(
                  totalPages,
                  currentPage + 1,
                ),
              )
            }
            disabled={
              currentPage === totalPages
            }
            className="grid h-10 w-10 place-items-center rounded-[18px] border border-highlight/10 bg-highlight/[0.06] text-highlight transition hover:bg-highlight/[0.1] disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Pagina siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
