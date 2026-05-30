import { prisma } from "@/lib/prisma";
import {
  TrabajoEstado,
} from "@prisma/client";
import { NextResponse } from "next/server";

const VALID_API_KEY =
  process.env
    .RIDER_INTERNAL_API_KEY;

type EstadoViaje =
  | "aceptado"
  | "cancelado"
  | "en camino"
  | "ha llegado"
  | "finalizado";

const estadoMap: Record<
  EstadoViaje,
  TrabajoEstado
> = {
  aceptado:
    TrabajoEstado.ACEPTADO,

  cancelado:
    TrabajoEstado.CANCELADO,

  "en camino":
    TrabajoEstado.EN_CAMINO,

  "ha llegado":
    TrabajoEstado.EN_SERVICIO,

  finalizado:
    TrabajoEstado.FINALIZADO,
};

export async function PUT(
  req: Request,
) {
  const startedAt =
    Date.now();

  try {
    console.info(
      "[Mock Rider statetravel] incoming request",
      {
        method:
          req.method,
        url:
          req.url,
        hasApiKey:
          Boolean(
            req.headers.get(
              "x-api-key",
            ),
          ),
        hasInternalApiKey:
          Boolean(
            req.headers.get(
              "x-internal-api-key",
            ),
          ),
      },
    );

    // -----------------------
    // API KEY
    // -----------------------

    const apiKey =
      req.headers.get(
        "x-api-key",
      );

    if (
      !apiKey ||
      apiKey !==
        VALID_API_KEY
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // -----------------------
    // BODY
    // -----------------------

    const body =
      await req.json();

    const {
      id_viaje,
      estado,
      driver,
    } = body;

    console.info(
      "[Mock Rider statetravel] body",
      {
        id_viaje,
        estado,
        driver,
      },
    );

    // -----------------------
    // VALIDACIONES
    // -----------------------
    
    if (
      !id_viaje ||
      !estado
    ) {
      console.warn(
        "[Mock Rider statetravel] validation failed",
        {
          reason:
            "missing_required_fields",
          id_viaje,
          estado,
        },
      );

      return NextResponse.json(
        {
          message:
            "Faltan campos obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !Object.keys(
        estadoMap,
      ).includes(
        estado,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Estado no válido",
        },
        {
          status: 400,
        },
      );
    }

    const trabajo =
      await prisma.trabajo.findUnique(
        {
          where: {
            id: id_viaje,
          },
        },
      );

    if (!trabajo) {
      console.warn(
        "[Mock Rider statetravel] trabajo not found",
        {
          id_viaje,
        },
      );

      return NextResponse.json(
        {
          message:
            "Viaje no encontrado",
        },
        {
          status: 404,
        },
      );
    }

  // -----------------------
// ACEPTAR VIAJE
// -----------------------

if (
  estado ===
  "aceptado"
) {
  if (!driver) {
    console.warn(
      "[Mock Rider statetravel] accepted without driver",
      {
        id_viaje,
      },
    );

    return NextResponse.json(
      {
        message:
          "Driver requerido",
      },
      {
        status: 400,
      },
    );
  }

  // -----------------------
  // VALIDAR DRIVER
  // -----------------------

  const driverExistente =
    await prisma.driver.findUnique(
      {
        where: {
          clerkUserId:
            driver,
        },
      },
    );

  if (
    !driverExistente
  ) {
    console.warn(
      "[Mock Rider statetravel] driver not found",
      {
        driver,
      },
    );

    return NextResponse.json(
      {
        message:
          "Driver no encontrado",
      },
      {
        status: 404,
      },
    );
  }

  // -----------------------
  // ACTUALIZAR VIAJE
  // -----------------------

  await prisma.trabajo.update(
    {
      where: {
        id: id_viaje,
      },
      data: {
        estado:
          TrabajoEstado.ACEPTADO,

        driverId:
          driverExistente.id,
      },
    },
  );

  console.info(
    "[Mock Rider statetravel] accepted updated",
    {
      id_viaje,
      driverClerkId:
        driver,
      driverId:
        driverExistente.id,
      durationMs:
        Date.now() -
        startedAt,
    },
  );

  return NextResponse.json(
    {
      message:
        "Viaje aceptado",
    },
  );
}
    // -----------------------
    // RESTO DE ESTADOS
    // -----------------------

    await prisma.trabajo.update({
      where: {
        id: id_viaje,
      },
      data: {
        estado:
          estadoMap[
            estado as EstadoViaje
          ],
      },
    });

    console.info(
      "[Mock Rider statetravel] state updated",
      {
        id_viaje,
        estado,
        estadoPrisma:
          estadoMap[
            estado as EstadoViaje
          ],
        durationMs:
          Date.now() -
          startedAt,
      },
    );

    const responseMap =
      {
        cancelado:
          "Viaje cancelado",

        "en camino":
          "Viaje en camino",

        "ha llegado":
          "Driver ha llegado",

        finalizado:
          "Viaje finalizado",
      };

    return NextResponse.json(
      {
        message:
          responseMap[
            estado as keyof typeof responseMap
          ],
      },
    );
  } catch (error) {
    console.error(
      "[Mock Rider statetravel] internal error",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
