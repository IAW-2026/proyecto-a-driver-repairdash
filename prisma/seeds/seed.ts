import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

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
  where: {
    clerkUserId: "clerk_demo_manuel",
  },
  update: {
    nombre: "Manuel",
    telefono: "+54 11 5555-0101",
    status: "ONLINE",
  },
  create: {
    clerkUserId: "clerk_demo_manuel",
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
