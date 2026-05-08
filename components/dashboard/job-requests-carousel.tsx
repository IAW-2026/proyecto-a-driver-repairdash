import Image from "next/image";
import type { DashboardJobRequest } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils/format";

type JobRequestsCarouselProps = {
  requests: DashboardJobRequest[];
};

export function JobRequestsCarousel({ requests }: JobRequestsCarouselProps) {
  return (
    <section className="mt-8 lg:mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Rider App mock</p>
          <h2 className="mt-2 text-2xl font-bold text-highlight">Solicitudes disponibles</h2>
        </div>
        <p className="hidden text-sm text-highlight/55 sm:block">{requests.length} compatibles</p>
      </div>

      <div className="mt-5 flex snap-x gap-4 overflow-x-auto pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {requests.map((request) => (
          <article
            key={request.id}
            className="min-h-[360px] w-[82vw] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-2xl border border-highlight/10 bg-highlight/[0.055] shadow-2xl shadow-black/25 sm:w-[340px]"
          >
            <div className="relative h-36 bg-[#341445]">
              <Image
                src={request.fotos[0] ?? "/window.svg"}
                alt=""
                fill
                sizes="340px"
                className="object-contain p-10 opacity-80"
              />
              <span className="absolute left-4 top-4 rounded-full border border-magenta/25 bg-magenta/20 px-3 py-1 text-xs font-bold text-highlight">
                {request.estado.replace("_", " ")}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-black text-highlight">{request.tipoServicio}</h3>
                  <p className="mt-1 truncate text-sm text-accent">
                    {request.ubicacion.barrio} · {request.ubicacion.direccion}
                  </p>
                </div>
                <p className="shrink-0 text-right text-lg font-black text-highlight">
                  {formatCurrency(request.precioEstimado)}
                </p>
              </div>

              <p className="mt-4 text-sm font-semibold text-highlight">
                {request.nombreCliente} {request.apellidoCliente}
              </p>
              <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-6 text-highlight/65">
                {request.descripcion}
              </p>

              <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3">
                <button
                  type="button"
                  className="h-12 rounded-2xl bg-magenta px-5 text-sm font-black text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90"
                >
                  Ver solicitud
                </button>
                <button
                  type="button"
                  aria-label="Omitir solicitud"
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-xl text-highlight"
                >
                  ×
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
