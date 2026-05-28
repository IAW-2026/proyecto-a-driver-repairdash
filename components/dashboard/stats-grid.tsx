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
    <section className="grid grid-cols-3 gap-2 sm:gap-3">
      {items.map((item) => {
        const Icon =
          "icon" in item
            ? item.icon
            : undefined;

        return (
          <article
            key={item.label}
            className="min-h-[76px] rounded-2xl border border-highlight/10 bg-highlight/[0.045] p-3 shadow-xl shadow-black/15 sm:min-h-32 sm:p-4"
          >
            <p className="truncate text-[10px] font-bold leading-none text-accent sm:text-xs">
              {item.label}
            </p>
            <div className="mt-2 flex min-w-0 items-center gap-1.5 sm:mt-3 sm:gap-2">
              {Icon ? (
                <Icon className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400 sm:h-6 sm:w-6" />
              ) : null}
              <p className="min-w-0 truncate text-[17px] font-black leading-tight text-highlight sm:text-2xl">
                {item.value}
              </p>
            </div>
            <p className="mt-2 hidden text-xs leading-5 text-highlight/55 sm:block">
              {item.detail}
            </p>
          </article>
        );
      })}
    </section>
  );
}
