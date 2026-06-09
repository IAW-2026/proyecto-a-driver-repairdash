import {
  Prisma,
  TrabajoEstado,
} from "@prisma/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  validateControlPlaneApiKey,
} from "@/lib/control-plane/auth";
import {
  parseMutationActor,
  readBodyObject,
} from "@/lib/control-plane/mutations";
import {
  buildPaginatedResponse,
  getPaginationParams,
} from "@/lib/control-plane/pagination";
import {
  serializeServiceType,
} from "@/lib/control-plane/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const serviceTypeInclude = {
  driverServicios: {
    select: {
      id: true,
    },
  },
  trabajos: {
    where: {
      estado: {
        notIn: [
          TrabajoEstado.FINALIZADO,
          TrabajoEstado.CANCELADO,
        ],
      },
    },
    select: {
      id: true,
    },
  },
} satisfies Prisma.TipoServicioInclude;

function readServicePayload(
  body: Record<string, unknown>,
) {
  const nombre =
    typeof body.nombre ===
    "string"
      ? body.nombre.trim()
      : "";

  const descripcion =
    typeof body.descripcion ===
    "string"
      ? body.descripcion.trim()
      : "";

  const precioBase =
    Number(body.precioBase);

  if (
    !nombre ||
    !descripcion ||
    !Number.isFinite(precioBase) ||
    precioBase <= 0
  ) {
    return null;
  }

  return {
    nombre,
    descripcion,
    precioBase,
  };
}

export async function GET(
  req: NextRequest,
) {
  const authError =
    validateControlPlaneApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const {
    page,
    limit,
    skip,
  } = getPaginationParams(req);

  const q =
    req.nextUrl.searchParams
      .get("q")
      ?.trim();

  const where: Prisma.TipoServicioWhereInput =
    q
      ? {
          OR: [
            {
              nombre: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              descripcion: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

  const [total, services] =
    await Promise.all([
      prisma.tipoServicio.count({
        where,
      }),
      prisma.tipoServicio.findMany({
        where,
        orderBy: {
          nombre: "asc",
        },
        skip,
        take: limit,
        include: serviceTypeInclude,
      }),
    ]);

  return NextResponse.json({
    status: "success",
    ...buildPaginatedResponse(
      services.map(
        serializeServiceType,
      ),
      total,
      page,
      limit,
    ),
  });
}

export async function POST(
  req: NextRequest,
) {
  const authError =
    validateControlPlaneApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const body =
    readBodyObject(
      await req.json().catch(
        () => null,
      ),
    );

  if (!body) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Body JSON invalido",
      },
      {
        status: 400,
      },
    );
  }

  const actorResult =
    parseMutationActor(body);

  if (!actorResult.ok) {
    return actorResult.response;
  }

  const payload =
    readServicePayload(body);

  if (!payload) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "nombre, descripcion y precioBase valido son obligatorios",
      },
      {
        status: 400,
      },
    );
  }

  const service =
    await prisma.tipoServicio.create({
      data: payload,
      include: serviceTypeInclude,
    }).catch((error: unknown) => {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return null;
      }

      throw error;
    });

  if (!service) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Ya existe un tipo de servicio con ese nombre",
      },
      {
        status: 409,
      },
    );
  }

  return NextResponse.json(
    {
      status: "success",
      data: serializeServiceType(
        service,
      ),
    },
    {
      status: 201,
    },
  );
}

