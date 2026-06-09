import {
  DriverStatus,
  Prisma,
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
  serializeDriver,
} from "@/lib/control-plane/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

function readStatus(
  value: string | null,
) {
  if (
    value &&
    Object.values(
      DriverStatus,
    ).includes(
      value as DriverStatus,
    )
  ) {
    return value as DriverStatus;
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

  const q =
    req.nextUrl.searchParams
      .get("q")
      ?.trim();

  const status =
    readStatus(
      req.nextUrl.searchParams.get(
        "status",
      ),
    );

  const where: Prisma.DriverWhereInput =
    {
      ...(status
        ? { status }
        : {}),
      ...(q
        ? {
            OR: [
              {
                nombre: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                clerkUserId: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

  const [total, workers] =
    await Promise.all([
      prisma.driver.count({
        where,
      }),
      prisma.driver.findMany({
        where,
        orderBy: {
          creadoEn: "desc",
        },
        skip,
        take: limit,
        include: {
          tiposServicio: {
            include: {
              tipoServicio: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
        },
      }),
    ]);

  return NextResponse.json({
    status: "success",
    ...buildPaginatedResponse(
      workers.map(
        serializeDriver,
      ),
      total,
      page,
      limit,
    ),
  });
}

