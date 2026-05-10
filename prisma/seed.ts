import "dotenv/config";
import { Prisma, TrabajoEstado } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  const servicios = await Promise.all([
    prisma.tipoServicio.upsert({
      where: { nombre: "Plomeria" },
      update: {
        descripcion: "Reparaciones de canerias, perdidas de agua, griferia y sanitarios.",
        precioBase: new Prisma.Decimal("25000.00"),
      },
      create: {
        nombre: "Plomeria",
        descripcion: "Reparaciones de canerias, perdidas de agua, griferia y sanitarios.",
        precioBase: new Prisma.Decimal("25000.00"),
      },
    }),
    prisma.tipoServicio.upsert({
      where: { nombre: "Electricidad" },
      update: {
        descripcion: "Instalaciones, diagnostico de fallas, tomas, tableros y luminarias.",
        precioBase: new Prisma.Decimal("30000.00"),
      },
      create: {
        nombre: "Electricidad",
        descripcion: "Instalaciones, diagnostico de fallas, tomas, tableros y luminarias.",
        precioBase: new Prisma.Decimal("30000.00"),
      },
    }),
    prisma.tipoServicio.upsert({
      where: { nombre: "Gas" },
      update: {
        descripcion: "Revision de conexiones, perdidas, artefactos y mantenimiento preventivo.",
        precioBase: new Prisma.Decimal("40000.00"),
      },
      create: {
        nombre: "Gas",
        descripcion: "Revision de conexiones, perdidas, artefactos y mantenimiento preventivo.",
        precioBase: new Prisma.Decimal("40000.00"),
      },
    }),
    prisma.tipoServicio.upsert({
      where: { nombre: "Aire acondicionado" },
      update: {
        descripcion: "Instalacion, limpieza, carga y reparacion de equipos split.",
        precioBase: new Prisma.Decimal("35000.00"),
      },
      create: {
        nombre: "Aire acondicionado",
        descripcion: "Instalacion, limpieza, carga y reparacion de equipos split.",
        precioBase: new Prisma.Decimal("35000.00"),
      },
    }),
  ]);

  const [plomeria, electricidad, gas] = servicios;

  const driver = await prisma.driver.upsert({
    where: { email: "manuel.driver@repairdash.local" },
    update: {
      nombre: "Manuel",
      telefono: "+54 11 5555-0101",
      status: "ONLINE",
    },
    create: {
      nombre: "Manuel",
      email: "manuel.driver@repairdash.local",
      telefono: "+54 11 5555-0101",
      status: "ONLINE",
    },
  });

  await Promise.all(
    [plomeria, electricidad, gas].map((tipoServicio) =>
      prisma.driverTipoServicio.upsert({
        where: {
          driverId_tipoServicioId: {
            driverId: driver.id,
            tipoServicioId: tipoServicio.id,
          },
        },
        update: {},
        create: {
          driverId: driver.id,
          tipoServicioId: tipoServicio.id,
        },
      }),
    ),
  );

  const riderIds = ["rider_demo_001", "rider_demo_002", "rider_demo_003"];

  await prisma.historialEstado.deleteMany({
    where: {
      trabajo: {
        driverId: driver.id,
        riderId: { in: riderIds },
      },
    },
  });

  await prisma.trabajo.deleteMany({
    where: {
      driverId: driver.id,
      riderId: { in: riderIds },
    },
  });

  await crearTrabajoDemo({
    driverId: driver.id,
    riderId: "rider_demo_001",
    tipoServicioId: plomeria.id,
    precioBase: plomeria.precioBase,
    descripcion: "Perdida de agua debajo de la cocina.",
    direccion: "Av. Corrientes 1234, CABA",
    estado: TrabajoEstado.PENDIENTE,
  });

  await crearTrabajoDemo({
    driverId: driver.id,
    riderId: "rider_demo_002",
    tipoServicioId: electricidad.id,
    precioBase: electricidad.precioBase,
    descripcion: "Corte parcial de energia en departamento.",
    direccion: "San Martin 850, CABA",
    estado: TrabajoEstado.EN_CAMINO,
    historial: [
      { estadoAnterior: null, estadoNuevo: TrabajoEstado.PENDIENTE },
      { estadoAnterior: TrabajoEstado.PENDIENTE, estadoNuevo: TrabajoEstado.ACEPTADO },
      { estadoAnterior: TrabajoEstado.ACEPTADO, estadoNuevo: TrabajoEstado.EN_CAMINO },
    ],
  });

  await crearTrabajoDemo({
    driverId: driver.id,
    riderId: "rider_demo_003",
    tipoServicioId: gas.id,
    precioBase: gas.precioBase,
    descripcion: "Revision de calefon y conexion de gas.",
    direccion: "Juncal 2200, CABA",
    estado: TrabajoEstado.FINALIZADO,
    historial: [
      { estadoAnterior: null, estadoNuevo: TrabajoEstado.PENDIENTE },
      { estadoAnterior: TrabajoEstado.PENDIENTE, estadoNuevo: TrabajoEstado.ACEPTADO },
      { estadoAnterior: TrabajoEstado.ACEPTADO, estadoNuevo: TrabajoEstado.EN_CAMINO },
      { estadoAnterior: TrabajoEstado.EN_CAMINO, estadoNuevo: TrabajoEstado.EN_SERVICIO },
      {
        estadoAnterior: TrabajoEstado.EN_SERVICIO,
        estadoNuevo: TrabajoEstado.FINALIZADO,
        motivo: "Trabajo completado correctamente.",
      },
    ],
  });
}

type CrearTrabajoDemoParams = {
  driverId: string;
  riderId: string;
  tipoServicioId: string;
  precioBase: Prisma.Decimal;
  descripcion: string;
  direccion: string;
  estado: TrabajoEstado;
  historial?: Array<{
    estadoAnterior: TrabajoEstado | null;
    estadoNuevo: TrabajoEstado;
    motivo?: string;
  }>;
};

async function crearTrabajoDemo(params: CrearTrabajoDemoParams) {
  const historial =
    params.historial ??
    [{ estadoAnterior: null, estadoNuevo: params.estado, motivo: "Trabajo creado." }];

  return prisma.trabajo.create({
    data: {
      driverId: params.driverId,
      riderId: params.riderId,
      tipoServicioId: params.tipoServicioId,
      descripcion: params.descripcion,
      direccion: params.direccion,
      estado: params.estado,
      montoEstimado: params.precioBase,
      historialEstados: {
        create: historial,
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
