"use client";

import { ChevronRight } from "lucide-react";

export type Service = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
  driverCount: number;
  trabajosCount: number;
  selected?: boolean;
};

type Props = {
  service: Service;
};

function getServiceIcon(
  nombre: string,
) {
  const lower =
    nombre.toLowerCase();

  if (
    lower.includes(
      "electric",
    )
  )
    return "⚡";

  if (
    lower.includes(
      "plomer",
    )
  )
    return "💧";

  if (
    lower.includes(
      "gas",
    )
  )
    return "🔥";

  if (
    lower.includes(
      "cerraj",
    )
  )
    return "🔑";

  if (
    lower.includes(
      "aire",
    )
  )
    return "❄️";

  if (
    lower.includes(
      "pint",
    )
  )
    return "🖌️";

  return "🛠️";
}

export function ServiceCard({
  service,
}: Props) {
  const icon =
    getServiceIcon(
      service.nombre,
    );

  return (
    <button
      className={`group relative w-full overflow-hidden rounded-[28px] border p-5 text-left transition-all duration-300 ${
        service.selected
          ? "border-fuchsia-500 bg-fuchsia-500/[0.08] shadow-[0_0_30px_rgba(217,70,239,0.25)]"
          : "border-white/10 bg-[#12071D] hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.04]"
      }`}
    >
      {/* glow */}
      {service.selected && (
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-transparent" />
      )}

      <div className="relative flex items-start gap-4">
        {/* icon */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-3xl shadow-[0_0_25px_rgba(217,70,239,0.12)]">
          {icon}
        </div>

        {/* content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="truncate text-xl font-bold text-white">
                {
                  service.nombre
                }
              </h3>

              <p className="mt-2 text-lg font-semibold text-white/85">
                $
                {service.precioBase.toLocaleString(
                  "es-AR",
                )}{" "}
                base
              </p>
            </div>

            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-white/30 transition-transform group-hover:translate-x-1" />
          </div>

          {/* stats */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <span>
                👥
              </span>
              <span>
                {
                  service.driverCount
                }{" "}
                drivers
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span>
                📦
              </span>
              <span>
                {
                  service.trabajosCount
                }{" "}
                trabajos
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}