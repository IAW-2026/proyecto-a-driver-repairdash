"use client";

import { Briefcase, TrendingUp, Users } from "lucide-react";

import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

type StatsCardsProps = {
  services: AdminServiceType[];
};

const formatNumber = new Intl.NumberFormat("es-AR");

export function StatsCards({ services }: StatsCardsProps) {
  const totalDrivers = new Set(
    services.flatMap((service) =>
      service.driverServicios.map((driverService) => driverService.driverId),
    ),
  ).size;

  const mostUsedService = [...services].sort(
    (a, b) => b.trabajos.length - a.trabajos.length,
  )[0];

  const cards = [
    {
      label: "Servicios activos",
      value: formatNumber.format(services.length),
      detail: "Disponibles para conductores",
      icon: Briefcase,
    },
    {
      label: "Conductores habilitados",
      value: formatNumber.format(totalDrivers),
      detail: "Asociados a cualquier servicio",
      icon: Users,
    },
    {
      label: "Servicio mas usado",
      value: mostUsedService?.nombre ?? "-",
      detail: `${formatNumber.format(mostUsedService?.trabajos.length ?? 0)} trabajos realizados`,
      icon: TrendingUp,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="group relative overflow-hidden rounded-[32px] border border-highlight/10 bg-highlight/[0.045] p-5 shadow-2xl shadow-black/15 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-magenta/30 hover:bg-highlight/[0.06] sm:p-6"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-magenta/10 blur-3xl transition group-hover:bg-magenta/20" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] border border-magenta/20 bg-magenta/15 text-magenta shadow-lg shadow-magenta/10">
                <Icon className="h-5 w-5" />
              </div>
              <p className="max-w-[9rem] text-right text-xs font-semibold uppercase leading-5 tracking-[0.18em] text-highlight/40">
                {card.label}
              </p>
            </div>

            <p className="relative mt-7 truncate text-3xl font-black leading-none text-highlight sm:text-4xl">
              {card.value}
            </p>
            <p className="relative mt-3 text-sm leading-6 text-highlight/55">
              {card.detail}
            </p>
          </article>
        );
      })}
    </section>
  );
}
