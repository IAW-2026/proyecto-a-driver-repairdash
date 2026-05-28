import { NextResponse } from "next/server";

import { createFeedbackTrabajoMock } from "@/lib/mocks/feedback.mock";

const VALID_API_KEY = process.env.FEEDBACK_INTERNAL_API_KEY;

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const {
      Idtrabajo,
      IdCliente,
      IdTrabajador,
      tipodeTrabajo,
    } = body;

    if (!Idtrabajo || !IdCliente || !IdTrabajador || !tipodeTrabajo) {
      return NextResponse.json(
        {
          message: "Faltan campos obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      createFeedbackTrabajoMock({
        Idtrabajo,
        IdCliente,
        IdTrabajador,
        tipodeTrabajo,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
