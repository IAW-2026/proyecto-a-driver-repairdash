import { NextResponse } from "next/server";
import { createReviewsUserMock } from "@/lib/mocks/feedback.mock";

const VALID_API_KEY = process.env.FEEDBACK_INTERNAL_API_KEY;

export async function PUT(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

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
