/**
 * Seed de trabajos PENDIENTE via webhook.
 * Uso: npx tsx prisma/seeds/seed-trabajos.ts
 *
 * El servidor debe estar corriendo (npm run dev).
 * Los trabajos se crean sin driver asignado — cualquier driver ONLINE
 * con el servicio habilitado los verá en su dashboard.
 */

import * as dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const API_KEY = process.env.RIDER_WEBHOOK_API_KEY ?? "";

const MOCK_TRABAJOS = [
  {
    riderId: "rider_demo_001",
    tipoServicioNombre: "Plomeria",
    direccion: "Av. Corrientes 1234, Balvanera",
    descripcion: "Perdida de agua bajo la cocina. Requiere revision urgente.",
    latitud: -34.6097,
    longitud: -58.3932,
  },
  {
    riderId: "rider_demo_002",
    tipoServicioNombre: "Electricidad",
    direccion: "San Martin 850, Microcentro",
    descripcion: "Corte parcial de energia en living y cocina.",
    latitud: -34.6037,
    longitud: -58.3816,
  },
  {
    riderId: "rider_demo_003",
    tipoServicioNombre: "Gas",
    direccion: "Juncal 2200, Recoleta",
    descripcion: "Revision preventiva de calefon y conexion principal.",
    latitud: -34.5875,
    longitud: -58.3938,
  },
];

async function main() {
  console.log("🌱 Iniciando seed de trabajos...\n");

  if (!API_KEY) {
    console.error("❌ RIDER_WEBHOOK_API_KEY no está definida en .env");
    process.exit(1);
  }

  for (const mock of MOCK_TRABAJOS) {
    const tipoServicio = await prisma.tipoServicio.findUnique({
      where: { nombre: mock.tipoServicioNombre },
      select: { id: true },
    });

    if (!tipoServicio) {
      console.warn(`⚠️  "${mock.tipoServicioNombre}" no encontrado en la BD — saltando.`);
      continue;
    }

    const body = {
      riderId: mock.riderId,
      tipoServicioId: tipoServicio.id,
      direccion: mock.direccion,
      descripcion: mock.descripcion,
      latitud: mock.latitud,
      longitud: mock.longitud,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/webhooks/nuevo-trabajo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json() as {
        status: string;
        mensaje: string;
        data?: { id_trabajo: string };
      };

      if (res.ok) {
        console.log(`✅ ${mock.tipoServicioNombre} → trabajo creado: ${data.data?.id_trabajo}`);
      } else {
        console.error(`❌ ${mock.tipoServicioNombre} → error: ${data.mensaje}`);
      }
    } catch (err) {
      console.error(`❌ ${mock.tipoServicioNombre} → no se pudo conectar:`, err);
    }
  }

  console.log("\n✅ Seed finalizado.");
  await prisma.$disconnect();
  await pool.end();
}

main();
