import { NextResponse } from "next/server";
import { createFeedbackReportMock } from "@/lib/mocks/feedback.mock";

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
    const { idTrabajo, idReportante, idReportado } = body;

    if (!idTrabajo || !idReportante || !idReportado) {
      return NextResponse.json(
        { message: "Faltan parámetros obligatorios" },
        { status: 400 }
      );
    }

    // Igual que en payments: devolvemos un mock con los IDs que llegaron
    return NextResponse.json(
      createFeedbackReportMock(idTrabajo, idReportante, idReportado),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
