
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey } from "@/lib/auth/api-key"
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
    const authorized =
      validateApiKey(req, [
        process.env
          .FEEDBACK_APP_API_KEY!,
      ]);

    if (!authorized) {
      return NextResponse.json(
        {
          status: "error",
          mensaje:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

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
            4.7,
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