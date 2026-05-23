import * as dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env
      .DATABASE_URL,
});

const adapter =
  new PrismaPg(pool);

const prisma =
  new PrismaClient({
    adapter,
  });

const MOCK_TRABAJOS = [
  {
    riderId: "rider_demo_001",
    tipoServicioNombre: "Plomeria",
    direccion: "Av. Corrientes 1234, Balvanera",
    descripcion: "Perdida de agua bajo la cocina. Requiere revision urgente.",
    fotos: [
      "https://picsum.photos/seed/repairdash-plumbing-1/900/675",
      "https://picsum.photos/seed/repairdash-plumbing-2/900/675",
    ],
    latitud: -34.6097,
    longitud: -58.3932,
  },
  {
    riderId: "rider_demo_002",
    tipoServicioNombre: "Electricidad",
    direccion: "San Martin 850, Microcentro",
    descripcion: "Corte parcial de energia en living y cocina.",
    fotos: [
      "https://picsum.photos/seed/repairdash-electric-1/900/675",
      "https://picsum.photos/seed/repairdash-electric-2/900/675",
      "https://picsum.photos/seed/repairdash-electric-3/900/675",
    ],
    latitud: -34.6037,
    longitud: -58.3816,
  },
  {
    riderId: "rider_demo_003",
    tipoServicioNombre: "Gas",
    direccion: "Juncal 2200, Recoleta",
    descripcion: "Revision preventiva de calefon y conexion principal.",
    fotos: [
      "https://picsum.photos/seed/repairdash-gas-1/900/675",
    ],
    latitud: -34.5875,
    longitud: -58.3938,
  },
];

async function main() {
  console.log("🌱 Iniciando seed de trabajos...\n");

  for (const mock of MOCK_TRABAJOS) {
    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { nombre: mock.tipoServicioNombre },
      select: { id: true, precioBase: true },
    });

    if (!tipoServicio) {
      console.warn(`⚠️  "${mock.tipoServicioNombre}" no encontrado en la BD — saltando.`);
      continue;
    }

    const trabajo = await prisma.trabajo.create({
      data: {
        riderId: mock.riderId,
        tipoServicioId: tipoServicio.id,
        direccion: mock.direccion,
        descripcion: mock.descripcion,
        fotos: mock.fotos,
        latitud: mock.latitud,
        longitud: mock.longitud,
        estado: "PENDIENTE",
        montoEstimado: tipoServicio.precioBase,
        historialEstados: {
          create: {
            estadoAnterior: null,
            estadoNuevo: "PENDIENTE",
            motivo: "Trabajo creado desde seed",
          },
        },
      },
    });

    console.log(`✅ ${mock.tipoServicioNombre} → trabajo creado: ${trabajo.id}`);
  }

  console.log("\n✅ Seed finalizado.");
  await prisma.$disconnect();
  await pool.end();
}

main();
