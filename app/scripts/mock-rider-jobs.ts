import * as dotenv from "dotenv";
dotenv.config();

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

const API_KEY =
  process.env.DRIVER_API_KEY ??
  "";

const JOB_INTERVAL_MS =
  Number(
    process.env.MOCK_RIDER_JOB_INTERVAL_MS ??
      10_000,
  );

const MOCK_TRABAJOS = [
  {
    riderId: "rider_demo_001",
    nombreRider: "Lucia",
    apellidoRider: "Ramos",
    valoracionRider: 4.8,
    tipoServicioNombre: "Plomeria",
    direccion: "Av. Corrientes 1234, Balvanera",
    descripcion:
      "Pérdida de agua bajo la cocina. Requiere revisión urgente.",
    fotos: [
      "https://picsum.photos/seed/repairdash-plumbing-1/900/675",
      "https://picsum.photos/seed/repairdash-plumbing-2/900/675",
    ],
  },
  {
    riderId: "rider_demo_002",
    nombreRider: "Mateo",
    apellidoRider: "Sosa",
    valoracionRider: 4.5,
    tipoServicioNombre: "Electricidad",
    direccion: "San Martín 850, Microcentro",
    descripcion:
      "Corte parcial de energía en living y cocina.",
    fotos: [
      "https://picsum.photos/seed/repairdash-electric-1/900/675",
      "https://picsum.photos/seed/repairdash-electric-2/900/675",
    ],
  },
  {
    riderId: "rider_demo_003",
    nombreRider: "Carla",
    apellidoRider: "Benitez",
    valoracionRider: 4.9,
    tipoServicioNombre: "Gas",
    direccion: "Juncal 2200, Recoleta",
    descripcion:
      "Revisión preventiva de calefón y conexión principal.",
    fotos: [
      "https://picsum.photos/seed/repairdash-gas-1/900/675",
    ],
  },
];

async function getTiposServicio() {
  const response =
    await fetch(
      `${BASE_URL}/api/tipos-servicios`,
      {
        headers: {
          "x-api-key":
            API_KEY,
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      `No se pudieron obtener tipos de servicio. Status: ${response.status}`,
    );
  }

  const json =
    await response.json();

  return json.data as Array<{
    id: string;
    nombre: string;
  }>;
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

async function main() {
  console.log(
    "🚀 Simulador RiderApp iniciado",
  );

  if (!API_KEY) {
    throw new Error(
      "Falta DRIVER_API_KEY en .env",
    );
  }

  const tipos =
    await getTiposServicio();

  let index = 0;

  while (true) {
    const mock =
      MOCK_TRABAJOS[
        index % MOCK_TRABAJOS.length
      ];

    const tipoServicio =
      tipos.find(
        (tipo) =>
          tipo.nombre.toLowerCase() ===
          mock.tipoServicioNombre.toLowerCase(),
      );

    if (!tipoServicio) {
      console.warn(
        `⚠️ Tipo de servicio no encontrado: ${mock.tipoServicioNombre}`,
      );

      index++;
      await sleep(
        JOB_INTERVAL_MS,
      );

      continue;
    }

    const idTrabajo =
      `rider_mock_${Date.now()}_${index}`;

    const body = {
      id_trabajo:
        idTrabajo,
      riderId:
        mock.riderId,
      nombreRider:
        mock.nombreRider,
      apellidoRider:
        mock.apellidoRider,
      valoracionRider:
        mock.valoracionRider,
      tipoServicioId:
        tipoServicio.id,
      direccion:
        mock.direccion,
      descripcion:
        mock.descripcion,
      fotos:
        mock.fotos,
    };

    const response =
      await fetch(
        `${BASE_URL}/api/webhooks/nuevo-trabajo`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            "x-api-key":
              API_KEY,
          },
          body:
            JSON.stringify(
              body,
            ),
        },
      );

    const data =
      await response.json();

    if (response.ok) {
      console.log(
        `✅ Trabajo publicado: ${idTrabajo} (${mock.tipoServicioNombre})`,
      );
    } else {
      console.error(
        `❌ Error publicando trabajo: ${response.status}`,
        data,
      );
    }

    index++;

    await sleep(
      JOB_INTERVAL_MS,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
