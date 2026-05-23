import Link from "next/link";
import { getDriverHistorial, type DriverHistorialMetrics } from "@/lib/services/historial.service";
import { HistorialPagination } from "./pagination";

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  ACEPTADO: "Aceptado",
  EN_CAMINO: "En camino",
  EN_SERVICIO: "En servicio",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: "bg-amber-500",
  ACEPTADO: "bg-blue-500",
  EN_CAMINO: "bg-cyan-500",
  EN_SERVICIO: "bg-magenta",
  FINALIZADO: "bg-green-500",
  CANCELADO: "bg-highlight/30",
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-2xl shadow-black/20 ${
        accent
          ? "border-magenta/30 bg-magenta/[0.07]"
          : "border-highlight/10 bg-highlight/[0.04]"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-highlight/55">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums sm:text-3xl ${
          accent ? "text-magenta" : "text-highlight"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-highlight/50">{sub}</p>
      )}
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-xs font-medium text-highlight/80">
        {label}
      </span>
      <div className="flex-1">
        <div className="h-2 overflow-hidden rounded-full bg-highlight/[0.08]">
          <div
            className={`h-full rounded-full transition-all ${color}`}
            style={{ width: `${Math.max(pct, 1)}%` }}
          />
        </div>
      </div>
      <span className="w-8 text-right text-xs font-semibold text-highlight/70">
        {count}
      </span>
    </div>
  );
}

function MetricsGrid({ data }: { data: DriverHistorialMetrics }) {
  const statusTotal = data.trabajosPorEstado.reduce((s, e) => s + e.cantidad, 0);

  return (
    <div className="mx-auto mt-2 max-w-2xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Trabajos</h1>
      <p className="mt-1 text-sm text-highlight/60 sm:mt-2 sm:text-base">
        Historial de trabajos realizados y en curso
      </p>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
        <StatCard label="Total" value={String(data.totalTrabajos)} />
        <StatCard label="Completados" value={String(data.completados)} />
        <StatCard
          label="Ingresos"
          value={`$${data.ingresosTotales.toLocaleString()}`}
          accent
        />
        <StatCard
          label="Aceptación"
          value={`${data.tasaAceptacion}%`}
          sub={
            data.rechazados > 0
              ? `${data.rechazados} rechazados`
              : undefined
          }
        />
      </div>

      {/* Secondary metrics */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4">
        <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-4 shadow-2xl shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wider text-highlight/55">
            Tiempo promedio
          </p>
          <p className="mt-1 text-lg font-bold text-highlight">
            {data.tiempoPromedioMinutos !== null
              ? data.tiempoPromedioMinutos < 60
                ? `${data.tiempoPromedioMinutos} min`
                : `${Math.floor(data.tiempoPromedioMinutos / 60)}h ${data.tiempoPromedioMinutos % 60}m`
              : "—"}
          </p>
          <p className="mt-0.5 text-xs text-highlight/50">
            De aceptado a finalizado
          </p>
        </div>
        <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-4 shadow-2xl shadow-black/20">
          <p className="text-xs font-medium uppercase tracking-wider text-highlight/55">
            Rechazados
          </p>
          <p className="mt-1 text-lg font-bold text-highlight">
            {data.rechazados}
          </p>
          <p className="mt-0.5 text-xs text-highlight/50">
            {data.rechazados > 0
              ? `${data.rechazados} trabajo${data.rechazados !== 1 ? "s" : ""} no aceptado${data.rechazados !== 1 ? "s" : ""}`
              : "Ninguno aún"}
          </p>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="mt-6 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:mt-8 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-highlight/70">
          Estado de trabajos
        </h2>
        <div className="mt-4 space-y-3">
          {data.trabajosPorEstado.map((e) => (
            <StatusBar
              key={e.estado}
              label={ESTADO_LABELS[e.estado] ?? e.estado}
              count={e.cantidad}
              total={statusTotal}
              color={ESTADO_COLORS[e.estado] ?? "bg-highlight/30"}
            />
          ))}
          {data.trabajosPorEstado.length === 0 && (
            <p className="text-sm text-highlight/50">Sin trabajos aún</p>
          )}
        </div>
      </div>

      {/* Top services */}
      {data.trabajosPorServicio.length > 0 && (
        <div className="mt-4 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:mt-6 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-highlight/70">
            Servicios más usados
          </h2>
          <div className="mt-4 space-y-3">
            {data.trabajosPorServicio.map((s) => (
              <div
                key={s.nombre}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-highlight/85">
                  {s.nombre}
                </span>
                <span className="text-xs tabular-nums text-highlight/60">
                  {s.cantidad} · ${s.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent jobs — paginated, visual only */}
      {data.ultimosTrabajos.length > 0 && (
        <div className="mt-4 rounded-2xl border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/20 sm:mt-6 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-highlight/70">
            Trabajos recientes
          </h2>
          <HistorialPagination items={data.ultimosTrabajos} />
        </div>
      )}

    </div>
  );
}

export default async function TrabajosPage() {
  const data = await getDriverHistorial();

  return (
    <main className="min-h-screen bg-primary p-4 text-highlight sm:p-6">
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-highlight/55 transition hover:text-highlight"
      >
        ← Volver al inicio
      </Link>

      <MetricsGrid data={data} />
    </main>
  );
}
