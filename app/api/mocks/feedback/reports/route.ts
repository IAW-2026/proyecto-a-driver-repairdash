import { NextResponse } from "next/server";
import { createReportMock } from "@/lib/mocks/feedback.mock";

export async function POST(req: Request) {
  try {
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
      createReportMock(idTrabajo, idReportante, idReportado),
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
