"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { DashboardJobRequest } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { rechazarTrabajo } from "@/lib/actions/trabajo.actions";

type JobRequestsCarouselProps = {
  requests: DashboardJobRequest[];
};

export function JobRequestsCarousel({ requests }: JobRequestsCarouselProps) {
  const router = useRouter();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const visible = requests.filter((r) => !dismissedIds.has(r.id));

  function handleDismiss(id: string) {
    startTransition(async () => {
      await rechazarTrabajo(id);
      setDismissedIds((prev) => new Set(prev).add(id));
    });
  }

  return (
    <section className="mt-8 lg:mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Rider App
          </p>
          <h2 className="mt-2 text-2xl font-bold text-highlight">
            Solicitudes disponibles
          </h2>
        </div>
        <p className="hidden text-sm text-highlight/55 sm:block">
          {visible.length} compatibles
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="mt-5 rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-8 text-center">
          <p className="text-sm text-highlight/45">No hay solicitudes disponibles</p>
        </div>
      ) : (
        <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((request) => (
            <article
              key={request.id}
              className="relative min-h-[360px] w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[28px] border border-highlight/10 bg-highlight/[0.055] shadow-2xl shadow-black/25 sm:w-[340px]"
            >
              {/* Imagen / header */}
              <div className="relative h-36 bg-[#341445]">
                <Image
                  src={request.fotos[0] ?? "/window.svg"}
                  alt=""
                  fill
                  sizes="340px"
                  className="object-contain p-10 opacity-80"
                />
              </div>

              {/* Contenido */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black text-highlight">
                      {request.tipoServicio}
                    </h3>
                    <p className="mt-1 truncate text-sm text-accent">
                      {[request.ubicacion.barrio, request.ubicacion.direccion]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-lg font-black text-highlight">
                    {formatCurrency(request.precioEstimado)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-highlight">
                    {request.nombreCliente} {request.apellidoCliente}
                  </p>
                  <span className="flex items-center gap-1 text-sm font-bold text-yellow-300">
                    ★ {request.ratingCliente.toFixed(1)}
                  </span>
                </div>

                <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-6 text-highlight/65">
                  {request.descripcion}
                </p>

                <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/trabajos/${request.id}`)}
                    className="h-12 rounded-2xl bg-[#F500F1] px-5 text-sm font-black text-white shadow-lg shadow-[#F500F1]/25 transition hover:bg-[#d400d0]"
                  >
                    Ver solicitud
                  </button>
                  <button
                    type="button"
                    aria-label="Omitir solicitud"
                    disabled={isPending}
                    onClick={() => handleDismiss(request.id)}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-xl text-highlight transition hover:border-highlight/25 hover:bg-highlight/10 disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
