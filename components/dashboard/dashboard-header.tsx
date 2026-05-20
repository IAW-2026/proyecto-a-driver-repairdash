import Link from "next/link";
import {
  Bell,
} from "lucide-react";

type DashboardHeaderProps = {
  driverName: string;
  driverImageUrl: string | null;
  notificationCount: number;
  onMenuClick: () => void;
};

export function DashboardHeader({
  driverName,
  driverImageUrl,
  notificationCount,
  onMenuClick,
}: DashboardHeaderProps) {
  const initials =
    driverName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "RD";

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-highlight/10 bg-primary/92 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Abrir menu"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-highlight shadow-lg shadow-black/20 transition hover:border-accent/35 hover:bg-highlight/[0.09]"
          >
            <span className="flex w-5 flex-col gap-1.5">
              <span className="h-0.5 rounded-full bg-highlight" />
              <span className="h-0.5 rounded-full bg-highlight/80" />
              <span className="h-0.5 rounded-full bg-highlight/60" />
            </span>
          </button>

          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="mt-1 truncate text-[24px] font-bold leading-tight text-highlight sm:text-3xl">
              Bienvenido, {driverName.split(" ")[0]}! 👋
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-highlight/68">
              Gestiona tu disponibilidad, revisa tus metricas y acepta solicitudes cercanas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:shrink-0">
          <Link
            href="/cuenta"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-highlight/10 bg-highlight/[0.06] p-2.5 pr-3 shadow-lg shadow-black/20 transition hover:border-accent/35 hover:bg-highlight/[0.09] md:w-64 md:flex-none"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-highlight/10 bg-accent/12 text-sm font-black text-highlight">
              {driverImageUrl ? (
                <img
                  src={driverImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-highlight">
                {driverName}
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-highlight/50">
                Administrar cuenta
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label={`Notificaciones: ${notificationCount}`}
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-xl shadow-lg shadow-black/20 transition hover:border-accent/35 hover:bg-highlight/[0.09]"
          >
            <Bell className="h-5 w-5 text-highlight" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-magenta shadow-[0_0_18px_rgba(245,0,241,0.9)]" />
          </button>
        </div>
      </div>
    </header>
  );
}