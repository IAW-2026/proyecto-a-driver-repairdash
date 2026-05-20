"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { DashboardJobRequest } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { rechazarTrabajo } from "@/lib/actions/trabajo.actions";

type JobRequestDetailProps = {
  request: DashboardJobRequest;
};

export function JobRequestDetail({ request }: JobRequestDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRechazar() {
    startTransition(async () => {
      await rechazarTrabajo(request.id);
      router.push("/");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-[#160822] text-highlight">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-[#160822]/90 backdrop-blur-sm">
        <div className="relative flex items-center justify-center px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute left-5 grid h-11 w-11 place-items-center rounded-full border border-highlight/10 bg-highlight/[0.06] text-xl text-highlight/70 transition hover:bg-highlight/10 sm:left-6"
            aria-label="Volver al inicio"
          >
            ✕
          </button>
          <h1 className="text-base font-bold text-highlight/80">Nuevo trabajo</h1>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-5 py-6 sm:px-6">
        <div className="space-y-4">
          {/* Título */}
          <div>
            <h2 className="text-3xl font-black leading-tight text-highlight sm:text-4xl">
              {request.tipoServicio}
            </h2>
            {(request.ubicacion.barrio || request.ubicacion.direccion) && (
              <p className="mt-1 text-sm text-highlight/50">
                {[request.ubicacion.barrio, request.ubicacion.direccion]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="rounded-[20px] border border-highlight/10 bg-highlight/[0.05] p-5">
            <p className="text-4xl font-black text-highlight">
              {formatCurrency(request.precioEstimado)}
            </p>
            <p className="mt-1 text-sm text-highlight/45">Pago estimado</p>
          </div>

          {/* Descripción */}
          {request.descripcion && (
            <div className="rounded-[20px] border border-highlight/10 bg-highlight/[0.05] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-highlight/40">
                Descripción
              </p>
              <p className="mt-2 text-sm leading-6 text-highlight/80">
                {request.descripcion}
              </p>
            </div>
          )}

          {/* Cliente */}
          <div className="rounded-[20px] border border-highlight/10 bg-highlight/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-highlight/40">
              Cliente
            </p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-base font-bold text-highlight">
                {request.nombreCliente} {request.apellidoCliente}
              </p>
              <span className="flex items-center gap-1.5 text-sm font-bold text-yellow-300">
                ★ {request.ratingCliente.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleRechazar}
              className="h-14 rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-sm font-black text-highlight transition hover:bg-highlight/10 disabled:opacity-50"
            >
              {isPending ? "..." : "Rechazar"}
            </button>
            <button
              type="button"
              className="h-14 rounded-2xl bg-[#F500F1] text-sm font-black text-white shadow-lg shadow-[#F500F1]/25 transition hover:bg-[#d400d0]"
              onClick={() => {
                // TODO: implementar aceptar trabajo
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
