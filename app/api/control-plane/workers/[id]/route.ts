import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  validateControlPlaneApiKey,
} from "@/lib/control-plane/auth";
import {
  serializeDriver,
} from "@/lib/control-plane/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

export async function GET(
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

  const { id } =
    await context.params;

  const worker =
    await prisma.driver.findFirst({
      where: {
        OR: [
          { id },
          {
            clerkUserId: id,
          },
        ],
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

  if (!worker) {
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

  return NextResponse.json({
    status: "success",
    data: serializeDriver(
      worker,
    ),
  });
}

