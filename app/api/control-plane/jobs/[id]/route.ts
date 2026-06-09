import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  validateControlPlaneApiKey,
} from "@/lib/control-plane/auth";
import {
  serializeTrabajo,
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

  const job =
    await prisma.trabajo.findUnique({
      where: {
        id,
      },
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
    });

  if (!job) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Trabajo no encontrado",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    status: "success",
    data: serializeTrabajo(job),
  });
}

