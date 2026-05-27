"use client";

import { ChevronRight, ClipboardList, Users, Wrench } from "lucide-react";

import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

type ServiceListItemProps = {
  service: AdminServiceType;
  selected: boolean;
  onSelect: (serviceId: string) => void;
};

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 0,
  style: "currency",
});

export function ServiceListItem({
  service,
  selected,
  onSelect,
}: ServiceListItemProps) {
  const assignedDrivers = new Set(
    service.trabajos
      .map((trabajo) => trabajo.driverId)
      .filter((driverId): driverId is string => Boolean(driverId)),
  ).size;

  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className={`group w-full rounded-[28px] border p-5 text-left transition duration-300 ${
        selected
          ? "border-magenta/70 bg-magenta/[0.11] shadow-[0_0_34px_rgba(245,0,241,0.16)]"
          : "border-highlight/10 bg-primary/35 hover:-translate-y-0.5 hover:border-magenta/35 hover:bg-highlight/[0.045]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border ${
            selected
              ? "border-magenta/30 bg-magenta/20 text-magenta"
              : "border-highlight/10 bg-highlight/[0.06] text-highlight/60"
          }`}
        >
          <Wrench className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-highlight">
                {service.nombre}
              </h3>
              <p className="mt-1 text-sm font-bold text-highlight/70">
                {moneyFormatter.format(service.precioBase)} base
              </p>
            </div>

            <ChevronRight
              className={`mt-1 h-5 w-5 shrink-0 transition ${
                selected
                  ? "text-magenta"
                  : "text-highlight/30 group-hover:translate-x-1 group-hover:text-highlight/55"
              }`}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold text-highlight/48">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {assignedDrivers} drivers asignados
            </span>
            <span className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {service.trabajos.length} trabajos activos
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
