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
  buildPaginatedResponse,
  getPaginationParams,
} from "@/lib/control-plane/pagination";
import {
  serializeTrabajo,
} from "@/lib/control-plane/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

function readEstado(
  value: string | null,
) {
  if (
    value &&
    Object.values(
      TrabajoEstado,
    ).includes(
      value as TrabajoEstado,
    )
  ) {
    return value as TrabajoEstado;
  }

  return undefined;
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

  const estado =
    readEstado(
      req.nextUrl.searchParams.get(
        "estado",
      ),
    );

  const q =
    req.nextUrl.searchParams
      .get("q")
      ?.trim();

  const where: Prisma.TrabajoWhereInput =
    {
      ...(estado
        ? { estado }
        : {}),
      ...(q
        ? {
            OR: [
              {
                id: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                riderId: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                direccion: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                nombreRider: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

  const [total, jobs] =
    await Promise.all([
      prisma.trabajo.count({
        where,
      }),
      prisma.trabajo.findMany({
        where,
        orderBy: {
          creadoEn: "desc",
        },
        skip,
        take: limit,
        include: {
          driver: {
            select: {
              id: true,
              clerkUserId: true,
              nombre: true,
              email: true,
            },
          },
          tipoServicio: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      }),
    ]);

  return NextResponse.json({
    status: "success",
    ...buildPaginatedResponse(
      jobs.map(
        serializeTrabajo,
      ),
      total,
      page,
      limit,
    ),
  });
}

