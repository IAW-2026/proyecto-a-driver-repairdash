import type { DriverDailyStats } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils/format";

type StatsGridProps = {
  stats: DriverDailyStats;
};

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    {
      label: "Completados",
      value: stats.trabajosCompletados.toString(),
      detail: "trabajos hoy",
    },
    {
      label: "Ingresos",
      value: formatCurrency(stats.ingresosDelDia),
      detail: "Payment App mock",
    },
    {
      label: "Calificacion",
      value: `${stats.ratingPromedio.toFixed(1)} ★`,
      detail: "Feedback App mock",
    },
    {
      label: "Conectado",
      value: stats.tiempoConectado,
      detail: "tiempo online",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article
          key={item.label}
          className="min-h-32 rounded-2xl border border-highlight/10 bg-highlight/[0.045] p-4 shadow-xl shadow-black/15"
        >
          <p className="text-xs font-semibold text-accent">{item.label}</p>
          <p className="mt-3 break-words text-2xl font-black leading-tight text-highlight">{item.value}</p>
          <p className="mt-2 text-xs leading-5 text-highlight/55">{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
