"use client";

import {
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  DashboardJobRequest,
  DriverAvailability,
} from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils/format";
import { rechazarTrabajo } from "@/lib/actions/trabajo.actions";

type JobRequestsCarouselProps = {
  requests: DashboardJobRequest[];
  driverStatus: DriverAvailability;
};

export function JobRequestsCarousel({
  requests,
  driverStatus,
}: JobRequestsCarouselProps) {
  const router = useRouter();
  const scrollRef =
    useRef<HTMLDivElement>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const visible = requests.filter((r) => !dismissedIds.has(r.id));
  const isOffline =
    driverStatus !== "ONLINE";

  function handleDismiss(id: string) {
    startTransition(async () => {
      await rechazarTrabajo(id);
      setDismissedIds((prev) => new Set(prev).add(id));
    });
  }

  function scrollRequests(direction: "left" | "right") {
    scrollRef.current?.scrollBy({
      left:
        direction === "left"
          ? -360
          : 360,
      behavior: "smooth",
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
        <div className="hidden items-center gap-2 sm:flex">
          <p className="mr-2 text-sm text-highlight/55">
            {isOffline ? "Offline" : `${visible.length} compatibles`}
          </p>
          <button
            type="button"
            onClick={() => scrollRequests("left")}
            disabled={isOffline || visible.length === 0}
            aria-label="Ver solicitudes anteriores"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-highlight transition hover:bg-highlight/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollRequests("right")}
            disabled={isOffline || visible.length === 0}
            aria-label="Ver mas solicitudes"
            className="grid h-10 w-10 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-highlight transition hover:bg-highlight/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isOffline ? (
        <div className="mt-5 rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-6 text-center sm:p-8">
          <p className="text-base font-bold text-highlight">
            Estas offline
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-highlight/55">
            Ponete online para ver solicitudes compatibles con tus servicios.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-5 rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-8 text-center">
          <p className="text-sm text-highlight/45">No hay solicitudes disponibles</p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="mt-5 flex flex-col gap-4 sm:snap-x sm:flex-row sm:overflow-x-auto sm:scroll-smooth sm:pb-5 sm:[-ms-overflow-style:none] sm:[scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden"
        >
          {visible.map((request) => (
            <article
              key={request.id}
              className="relative min-h-[340px] w-full shrink-0 overflow-hidden rounded-[28px] border border-highlight/10 bg-highlight/[0.055] shadow-2xl shadow-black/25 sm:w-[340px] sm:snap-start"
            >
              <div className="relative h-36 bg-[#341445]">
                <img
                  src={request.fotos[0] ?? "/window.svg"}
                  alt=""
                  className="h-full w-full object-cover opacity-85"
                />
                {request.fotos.length === 0 && (
                  <div className="absolute inset-0 grid place-items-center bg-highlight/[0.03]">
                    <span className="rounded-full border border-highlight/10 bg-primary/50 px-3 py-1 text-xs font-semibold text-highlight/55">
                      Sin fotos
                    </span>
                  </div>
                )}
              </div>

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
