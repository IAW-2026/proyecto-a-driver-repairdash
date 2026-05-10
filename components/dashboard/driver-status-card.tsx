import type { DriverAvailability } from "@/types/dashboard";

type DriverStatusCardProps = {
  status: DriverAvailability;
  offeredServices: string[];
  onToggle: () => void;
};

const statusCopy: Record<DriverAvailability, { title: string; description: string }> = {
  ONLINE: {
    title: "ONLINE",
    description: "Estas visible para nuevas solicitudes compatibles con tus servicios.",
  },
  OFFLINE: {
    title: "OFFLINE",
    description: "No estas recibiendo nuevas solicitudes en este momento.",
  },
  EN_TRABAJO: {
    title: "EN TRABAJO",
    description: "Tienes un servicio activo en progreso.",
  },
};

export function DriverStatusCard({ status, offeredServices, onToggle }: DriverStatusCardProps) {
  const isOnline = status === "ONLINE";

  return (
    <article className="relative overflow-hidden rounded-2xl border border-highlight/10 bg-highlight/[0.055] p-5 shadow-2xl shadow-black/25">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[48px] bg-magenta/15" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Estado actual</p>
          <h2 className="mt-3 text-4xl font-black leading-none text-highlight">{statusCopy[status].title}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-highlight/68">{statusCopy[status].description}</p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isOnline}
          className={`relative h-8 w-16 shrink-0 rounded-full border p-1 transition ${
            isOnline ? "border-magenta/60 bg-magenta/30" : "border-highlight/15 bg-highlight/10"
          }`}
        >
          <span
            className={`block h-5.5 w-5.5 rounded-full bg-highlight shadow-lg transition ${
              isOnline ? "translate-x-8 shadow-magenta/40" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {offeredServices.map((service) => (
          <span
            key={service}
            className="shrink-0 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-highlight"
          >
            {service}
          </span>
        ))}
      </div>
    </article>
  );
}
