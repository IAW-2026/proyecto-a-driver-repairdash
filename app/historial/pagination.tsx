"use client";

import { useState } from "react";

type TrabajoItem = {
  id: string;
  tipoServicio: string;
  direccion: string;
  estado: string;
  tiempoMinutos: number | null;
};

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADO: "Aceptado",
  EN_CAMINO: "En camino",
  EN_SERVICIO: "En servicio",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const ESTADO_DOT: Record<string, string> = {
  PENDIENTE: "bg-amber-500",
  ACEPTADO: "bg-blue-500",
  EN_CAMINO: "bg-cyan-500",
  EN_SERVICIO: "bg-magenta",
  FINALIZADO: "bg-green-500",
  CANCELADO: "bg-highlight/30",
};

function Row({ t }: { t: TrabajoItem }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-highlight/10 bg-highlight/[0.03] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-highlight">
          {t.tipoServicio}
        </p>
        <p className="mt-0.5 truncate text-xs text-highlight/55">
          {t.direccion}
        </p>
      </div>
      <div className="ml-3 flex items-center gap-3">
        {t.tiempoMinutos !== null && (
          <span className="text-xs tabular-nums text-highlight/50">
            {t.tiempoMinutos < 60
              ? `${t.tiempoMinutos} min`
              : `${Math.floor(t.tiempoMinutos / 60)}h ${t.tiempoMinutos % 60}m`}
          </span>
        )}
        <div className="text-right">
          <p className="flex items-center gap-1 text-xs text-highlight/55">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${ESTADO_DOT[t.estado] ?? "bg-highlight/30"}`}
            />
            {ESTADO_LABELS[t.estado] ?? t.estado}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HistorialPagination({
  items,
  pageSize = 3,
}: {
  items: TrabajoItem[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(items.length / pageSize);
  const slice = items.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <>
      <div className="mt-4 space-y-2">
        {slice.map((item) => (
          <Row key={item.id} t={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-highlight/10 bg-highlight/[0.06] text-xs font-bold text-highlight/70 transition hover:bg-highlight/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ‹
          </button>

          <span className="text-xs tabular-nums text-highlight/55">
            {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-highlight/10 bg-highlight/[0.06] text-xs font-bold text-highlight/70 transition hover:bg-highlight/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
