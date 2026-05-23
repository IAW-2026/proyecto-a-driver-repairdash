import { NextResponse } from "next/server";
import { createReviewsUserMock } from "@/lib/mocks/feedback.mock";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { idTrabajo } = body;

    if (!idTrabajo) {
      return NextResponse.json(
        { message: "Falta idTrabajo" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      createReviewsUserMock(idTrabajo),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
