import { NextResponse } from "next/server";

import { getFeedbackPublicReportsMock } from "@/lib/mocks/feedback.mock";

const VALID_API_KEY = process.env.FEEDBACK_INTERNAL_API_KEY;

type Params = {
  userId: string;
};

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<Params>;
  },
) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey || apiKey !== VALID_API_KEY) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;

    return NextResponse.json(
      getFeedbackPublicReportsMock(userId),
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
