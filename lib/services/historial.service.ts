import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import {
  getPaymentDailySummary,
  getPaymentMetrics,
} from "@/lib/services/external/payments.client";

type EstadoCont = {
  estado: string;
  cantidad: number;
};

type ServicioCont = {
  nombre: string;
  cantidad: number;
};

export type DriverHistorialMetrics = {
  totalTrabajos: number;
  completados: number;
  cancelados: number;
  rechazados: number;
  ingresosTotales: number;
  tasaAceptacion: number;
  tiempoPromedioMinutos: number | null;
  trabajosPorEstado: EstadoCont[];
  trabajosPorServicio: ServicioCont[];
  ultimosTrabajos: Array<{
    id: string;
    tipoServicio: string;
    direccion: string;
    estado: string;
    montoEstimado: number;
    creadoEn: Date;
    completadoEn: Date | null;
    tiempoMinutos: number | null;
  }>;
};

export async function getDriverHistorial(): Promise<DriverHistorialMetrics> {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const driver = await prisma.driver.findUnique({
    where: { clerkUserId: user.id },
    include: {
      trabajos: {
        include: {
          tipoServicio: true,
          historialEstados: { orderBy: { creadoEn: "asc" } },
        },
        orderBy: { creadoEn: "desc" },
      },
      trabajosRechazados: true,
    },
  });

  if (!driver) throw new Error("Driver not found");

  const payments =
    await getPaymentDailySummary(
      driver.id,
    );

  const paymentMetrics =
    getPaymentMetrics(
      payments,
    );

  const trabajos = driver.trabajos;
  const totalTrabajos = trabajos.length;
  const completados = trabajos.filter((t) => t.estado === "FINALIZADO").length;
  const cancelados = trabajos.filter((t) => t.estado === "CANCELADO").length;
  const totalRechazos = driver.trabajosRechazados.length;

  const ingresosTotales =
    paymentMetrics.ingresosDelDia;

  const aceptadosCount = trabajos.filter(
    (t) => t.estado !== "PENDIENTE" && t.estado !== "RECHAZADO"
  ).length;
  const decisionsTotal = aceptadosCount + totalRechazos;
  const tasaAceptacion =
    decisionsTotal > 0
      ? Math.round((aceptadosCount / decisionsTotal) * 100)
      : 0;

  const trabajosPorEstado: EstadoCont[] = [
    { estado: "PENDIENTE", cantidad: trabajos.filter((t) => t.estado === "PENDIENTE").length },
    { estado: "ACEPTADO", cantidad: trabajos.filter((t) => t.estado === "ACEPTADO").length },
    { estado: "EN_CAMINO", cantidad: trabajos.filter((t) => t.estado === "EN_CAMINO").length },
    { estado: "EN_SERVICIO", cantidad: trabajos.filter((t) => t.estado === "EN_SERVICIO").length },
    { estado: "FINALIZADO", cantidad: completados },
    { estado: "CANCELADO", cantidad: cancelados },
  ].filter((e) => e.cantidad > 0);

  const servicioMap = new Map<string, ServicioCont>();
  for (const t of trabajos) {
    const nombre = t.tipoServicio.nombre;
    const existing = servicioMap.get(nombre) ?? {
      nombre,
      cantidad: 0,
    };
    existing.cantidad++;
    servicioMap.set(nombre, existing);
  }
  const trabajosPorServicio = Array.from(servicioMap.values()).sort(
    (a, b) => b.cantidad - a.cantidad
  );

  let totalMinutos = 0;
  let countConTiempo = 0;

  const ultimosTrabajos = trabajos.slice(0, 20).map((t) => {
    const aceptado = t.historialEstados.find(
      (h) => h.estadoNuevo === "ACEPTADO"
    );
    const finalizado = t.historialEstados.find(
      (h) => h.estadoNuevo === "FINALIZADO"
    );

    const completadoEn = finalizado?.creadoEn ?? null;
    const inicio = aceptado?.creadoEn ?? t.creadoEn;
    let tiempoMinutos: number | null = null;
    if (finalizado) {
      const diffMs = finalizado.creadoEn.getTime() - inicio.getTime();
      tiempoMinutos = Math.round(diffMs / 60000);
      totalMinutos += tiempoMinutos;
      countConTiempo++;
    }

    return {
      id: t.id,
      tipoServicio: t.tipoServicio.nombre,
      direccion: t.direccion,
      estado: t.estado,
      montoEstimado: Number(t.montoEstimado),
      creadoEn: t.creadoEn,
      completadoEn,
      tiempoMinutos,
    };
  });

  const tiempoPromedioMinutos =
    countConTiempo > 0 ? Math.round(totalMinutos / countConTiempo) : null;

  return {
    totalTrabajos,
    completados,
    cancelados,
    rechazados: totalRechazos,
    ingresosTotales,
    tasaAceptacion,
    tiempoPromedioMinutos,
    trabajosPorEstado,
    trabajosPorServicio,
    ultimosTrabajos,
  };
}
