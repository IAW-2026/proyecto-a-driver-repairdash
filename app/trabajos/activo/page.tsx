import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/format";

const ESTADOS = ["ACEPTADO", "EN_CAMINO", "EN_SERVICIO", "FINALIZADO"] as const;

const STATUS_COPY = {
  ACEPTADO: {
    title: "ACEPTADO",
    subtitle: "Solicitud aceptada. Dirígete al cliente.",
    color: "text-[#F500F1]",
    button: "Iniciar viaje",
    buttonColor: "from-[#F500F1] to-[#d400d0]",
  },
  EN_CAMINO: {
    title: "EN CAMINO",
    subtitle: "Estás viajando hacia el cliente.",
    color: "text-blue-400",
    button: "Ya llegué",
    buttonColor: "from-blue-500 to-blue-700",
  },
  EN_SERVICIO: {
    title: "EN SERVICIO",
    subtitle: "Trabajo actualmente en progreso.",
    color: "text-yellow-400",
    button: "Finalizar trabajo",
    buttonColor: "from-yellow-400 to-yellow-600",
  },
  FINALIZADO: {
    title: "FINALIZADO",
    subtitle: "Trabajo completado.",
    color: "text-green-400",
    button: null,
    buttonColor: "",
  },
};

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "hace unos segundos";
  if (diffMinutes < 60) return `hace ${diffMinutes} min`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} d`;
}

export default async function TrabajoActivoPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    select: { id: true, status: true },
  });

  if (!driver || driver.status !== "EN_TRABAJO") redirect("/");

  const trabajo = await prisma.trabajo.findFirst({
    where: {
      driverId: driver.id,
      estado: { in: ["ACEPTADO", "EN_CAMINO", "EN_SERVICIO"] },
    },
    include: { tipoServicio: true },
    orderBy: { actualizadoEn: "desc" },
  });

  if (!trabajo) redirect("/");

  const currentState = trabajo.estado as keyof typeof STATUS_COPY;
  const currentIndex = ESTADOS.indexOf(currentState);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#271033] via-[#271033] to-[#160822] text-highlight flex flex-col">
      <header className="sticky top-0 z-20 bg-[#160822]/90 backdrop-blur-sm flex items-center justify-center px-5 py-4">
        <a
          href="/"
          className="absolute left-5 grid h-11 w-11 place-items-center rounded-full border border-highlight/10 bg-highlight/[0.06] text-xl text-highlight/70 transition hover:bg-highlight/10"
        >
          ←
        </a>
        <h1 className="text-base font-bold text-highlight/80">Trabajo en curso</h1>
      </header>

      <section className="flex flex-col items-center justify-center py-10 space-y-2">
        <span className={`text-5xl sm:text-6xl font-black ${STATUS_COPY[currentState].color}`}>
          {STATUS_COPY[currentState].title}
        </span>
        <span className="text-sm text-highlight/50">
          {formatRelativeTime(trabajo.actualizadoEn)}
        </span>
        <span className="mt-2 rounded-full bg-[#F500F1]/20 px-3 py-1 text-xs font-bold text-[#F500F1]">
          Estado
        </span>
        <p className="mt-3 max-w-md text-sm leading-6 text-highlight/60">
          {STATUS_COPY[currentState].subtitle}
        </p>
      </section>

      <section className="px-6 space-y-6">
        <div className="rounded-[24px] border border-highlight/10 bg-highlight/[0.05] p-6 shadow-lg shadow-[#F500F1]/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Servicio</p>
              <h3 className="mt-2 text-3xl font-black text-highlight">{trabajo.tipoServicio.nombre}</h3>
              <p className="mt-3 text-sm text-highlight/60">{trabajo.direccion}</p>
            </div>
            <p className="text-2xl font-black text-highlight">
              {formatCurrency(Number(trabajo.montoEstimado))}
            </p>
          </div>
          {trabajo.descripcion && (
            <div className="mt-6 rounded-2xl border border-highlight/10 bg-primary/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-highlight/40">Descripción</p>
              <p className="mt-2 text-sm leading-6 text-highlight/75">{trabajo.descripcion}</p>
            </div>
          )}
        </div>

        <div className="rounded-[24px] border border-highlight/10 bg-highlight/[0.05] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Progreso</p>
          <div className="mt-6 space-y-5">
            {ESTADOS.map((estado, index) => {
              const isCompleted = index <= currentIndex;
              const isCurrent = estado === currentState;
              return (
                <div key={estado} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-5 w-5 rounded-full ${
                        isCompleted ? "bg-[#F500F1]" : "bg-highlight/20"
                      }`}
                    />
                    {index < ESTADOS.length - 1 && (
                      <div
                        className={`mt-1 h-12 w-[2px] ${
                          index < currentIndex ? "bg-[#F500F1]" : "bg-highlight/10"
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`font-bold ${
                      isCurrent ? "text-highlight" : "text-highlight/45"
                    }`}
                  >
                    {estado}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {STATUS_COPY[currentState].button && (
        <div className="sticky bottom-0 px-6 py-6 bg-gradient-to-t from-[#160822] via-[#160822]/90 to-transparent">
          <button
            type="button"
            className={`h-16 w-full rounded-2xl bg-gradient-to-r ${STATUS_COPY[currentState].buttonColor} text-lg font-black text-white shadow-lg shadow-[#F500F1]/25 transition hover:opacity-90`}
          >
            {STATUS_COPY[currentState].button}
          </button>
        </div>
      )}
    </main>
  );
}
