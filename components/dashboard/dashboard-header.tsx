type DashboardHeaderProps = {
  driverName: string;
  notificationCount: number;
  onMenuClick: () => void;
};

export function DashboardHeader({ driverName, notificationCount, onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4">
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
        <p className="text-[13px] font-medium text-accent">Panel del conductor</p>
        <h1 className="mt-1 truncate text-[26px] font-bold leading-tight text-highlight sm:text-3xl">
          ¡Hola, {driverName}! 👋
        </h1>
        <p className="mt-1 max-w-xl text-sm leading-6 text-highlight/68">
          Gestiona tu disponibilidad, revisa tus metricas y acepta solicitudes cercanas.
        </p>
      </div>

      <button
        type="button"
        aria-label={`Notificaciones: ${notificationCount}`}
        className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-xl shadow-lg shadow-black/20 transition hover:border-accent/35 hover:bg-highlight/[0.09]"
      >
        <span aria-hidden="true" className="text-highlight">
          ◔
        </span>
        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-magenta shadow-[0_0_18px_rgba(245,0,241,0.9)]" />
      </button>
    </header>
  );
}
