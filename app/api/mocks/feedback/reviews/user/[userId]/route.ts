import { NextResponse } from "next/server";

import { getFeedbackUserRatingMock } from "@/lib/mocks/feedback.mock";

type Params = {
  userId: string;
};

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params: Promise<Params>;
  },
) {
  try {
    const { userId } = await params;

    return NextResponse.json(
      getFeedbackUserRatingMock(userId),
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
