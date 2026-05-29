import Link from "next/link";
import {
  Activity,
  BadgeCheck,
  LogIn,
  ShieldCheck,
  UserPlus,
  Wrench,
} from "lucide-react";

export function PublicHome() {
  return (
    <main className="relative flex h-dvh w-full max-w-full overflow-hidden bg-primary px-4 py-4 text-highlight sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(245,0,241,0.12),transparent_32%),linear-gradient(180deg,rgba(39,16,51,0.96),#271033_48%,#32143f)]" />

      <section className="relative mx-auto flex h-full w-full min-w-0 flex-col items-center justify-center pb-12 text-center sm:pb-16">
        <div className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br from-magenta to-accent text-white shadow-2xl shadow-magenta/25 sm:size-[70px] sm:rounded-[20px]">
          <Wrench
            aria-hidden
            className="size-4.5 sm:size-8"
            strokeWidth={2.35}
          />
        </div>

        <h1 className="mt-2.5 max-w-full text-[28px] font-black leading-none tracking-normal text-highlight sm:mt-5 sm:text-[54px]">
          Repair<span className="text-magenta">Dash</span>
        </h1>

        <p className="mt-1.5 max-w-[250px] text-[11px] font-medium text-highlight/58 sm:mt-3 sm:max-w-none sm:text-base">
          Plataforma para trabajadores tecnicos
        </p>

        <div className="mt-4 w-full max-w-[282px] rounded-[18px] border border-highlight/10 bg-highlight/[0.035] px-3.5 py-3.5 shadow-2xl shadow-black/20 backdrop-blur min-[390px]:max-w-[305px] sm:mt-8 sm:w-[440px] sm:max-w-[440px] sm:rounded-[22px] sm:px-7 sm:py-7">
          <div className="mx-auto inline-flex max-w-full items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[9px] font-bold text-cyan-200 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
            <span className="size-1.5 rounded-full bg-cyan-300 sm:size-2" />
            Realtime activo
          </div>

          <h2 className="mx-auto mt-2.5 max-w-[240px] text-[14px] font-black leading-tight text-highlight min-[360px]:text-[15px] sm:mt-5 sm:max-w-[350px] sm:text-[23px]">
            Recibi solicitudes y gestiona tus trabajos.
          </h2>

          <p className="mx-auto mt-2.5 max-w-[250px] text-[10.5px] leading-4 text-highlight/58 sm:mt-4 sm:max-w-[370px] sm:text-base sm:leading-6">
            Estado online, seguimiento del servicio e ingresos integrados en un
            solo panel.
          </p>
        </div>

        <div className="mt-4 grid w-full max-w-[240px] grid-cols-1 gap-2 min-[390px]:max-w-[270px] sm:mt-8 sm:flex sm:w-auto sm:max-w-none sm:items-center sm:justify-center sm:gap-3">
          <Link
            href="/login"
            className="inline-flex h-9.5 min-w-0 items-center justify-center gap-2 rounded-[14px] bg-magenta px-4 text-xs font-black text-white shadow-xl shadow-magenta/25 transition hover:bg-magenta/90 sm:h-14 sm:w-auto sm:gap-3 sm:rounded-2xl sm:px-6 sm:text-sm"
          >
            <LogIn
              aria-hidden
              className="size-3.5 sm:size-4.5"
            />
            Ingresar
          </Link>

          <Link
            href="/sign-up"
            className="inline-flex h-9.5 min-w-0 items-center justify-center gap-2 rounded-[14px] border border-highlight/12 bg-highlight/[0.04] px-4 text-xs font-black text-highlight shadow-xl shadow-black/10 transition hover:bg-highlight/[0.08] sm:h-14 sm:w-auto sm:gap-3 sm:rounded-2xl sm:px-6 sm:text-sm"
          >
            <UserPlus
              aria-hidden
              className="size-3.5 sm:size-4.5"
            />
            Crear cuenta
          </Link>
        </div>

        <div className="mt-4 flex max-w-[270px] flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 text-[10px] font-medium text-highlight/48 sm:mt-8 sm:max-w-full sm:gap-x-7 sm:text-xs">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-3 text-cyan-300 sm:size-4" />
            Seguro
          </span>

          <span className="inline-flex items-center gap-2">
            <Activity className="size-3 text-sky-300 sm:size-4" />
            En vivo
          </span>

          <span className="inline-flex items-center gap-2">
            <BadgeCheck className="size-3 text-accent sm:size-4" />
            Verificado
          </span>
        </div>

        <p className="absolute bottom-4 text-[10px] text-highlight/38 sm:bottom-6 sm:text-xs">
          &copy; 2026 RepairDash
        </p>
      </section>
    </main>
  );
}
