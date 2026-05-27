import { formatCurrency } from "@/lib/utils/format";
import type { DriverDailyStats } from "@/types/dashboard";
import { Star } from "lucide-react";

type StatsGridProps = {
  stats: DriverDailyStats;
};

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    {
      label: "Completados",
      value: stats.trabajosCompletados.toString(),
      detail: "Payment App mock",
    },
    {
      label: "Ingresos",
      value: formatCurrency(stats.ingresosDelDia),
      detail: "Payment App mock",
    },
    {
      label: "Calificacion",
      value: stats.ratingPromedio.toFixed(1),
      detail: "Feedback App mock",
      icon: Star,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon =
          "icon" in item
            ? item.icon
            : undefined;

        return (
          <article
            key={item.label}
            className="min-h-32 rounded-2xl border border-highlight/10 bg-highlight/[0.045] p-4 shadow-xl shadow-black/15"
          >
            <p className="text-xs font-semibold text-accent">{item.label}</p>
            <div className="mt-3 flex items-center gap-2">
              {Icon ? (
                <Icon className="h-6 w-6 fill-amber-400 text-amber-400" />
              ) : null}
              <p className="break-words text-2xl font-black leading-tight text-highlight">
                {item.value}
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-highlight/55">
              {item.detail}
            </p>
          </article>
        );
      })}
    </section>
  );
}
