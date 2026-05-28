
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { prisma } from "@/lib/prisma";
import { validateInternalApiKey } from "@/lib/auth/internal-auth";
import { getDriverFeedback } from "@/lib/services/external/feedback.client";


export const dynamic = "force-dynamic";;

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
): Promise<Response> {
  try {
    const authError =
      validateInternalApiKey(
        req,
      );

    if (authError)
      return authError;

    const { id } =
      await context.params;

    const driver =
      await prisma.driver.findUnique(
        {
          where: {
            id,
          },
        },
      );

    if (!driver) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Driver no encontrado",
        },
        {
          status: 404,
        },
      );
    }

    const feedback =
      await getDriverFeedback(
        driver.id,
      );

    return NextResponse.json(
      {
        status:
          "success",
        mensaje:
          "Datos del trabajador obtenidos correctamente",
        data: {
          id_driver:
            driver.id,
          nombre:
            driver.nombre,
          rating_promedio:
            feedback.valoracion,
          estado:
            driver.status.toLowerCase(),
        },
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        status:
          "error",
        mensaje:
          "Error interno del servidor",
      },
      {
        status: 500,
      },
    );
  }
}
