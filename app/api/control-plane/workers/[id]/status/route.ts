import {
  DriverStatus,
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
  serializeDriver,
} from "@/lib/control-plane/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
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

  const status =
    body.status;

  if (
    typeof status !== "string" ||
    !Object.values(
      DriverStatus,
    ).includes(
      status as DriverStatus,
    )
  ) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "status debe ser OFFLINE, ONLINE o EN_TRABAJO",
      },
      {
        status: 400,
      },
    );
  }

  const { id } =
    await context.params;

  const existingWorker =
    await prisma.driver.findFirst({
      where: {
        OR: [
          { id },
          {
            clerkUserId: id,
          },
        ],
      },
      select: {
        id: true,
      },
    });

  if (!existingWorker) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Worker no encontrado",
      },
      {
        status: 404,
      },
    );
  }

  const worker =
    await prisma.driver.update({
      where: {
        id: existingWorker.id,
      },
      data: {
        status:
          status as DriverStatus,
      },
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
    });

  return NextResponse.json({
    status: "success",
    data: serializeDriver(
      worker,
    ),
  });
}
