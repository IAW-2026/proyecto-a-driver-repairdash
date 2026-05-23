
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { prisma } from "@/lib/prisma";
import { validateInternalApiKey } from "@/lib/auth/internal-auth";


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
        process.env
          .DRIVER_FEEDBACK_API_KEY_HASH,
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
            4.7,//TODO: calcular rating promedio
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