import {
  NextResponse,
} from "next/server";

import {
  getPaymentWalletMock,
} from "@/lib/mocks/payments.mock";

const VALID_API_KEY =
  process.env
    .PAYMENTS_INTERNAL_API_KEY;

type Params = {
  driverId:
    string;
};

export async function GET(
  req: Request,
  {
    params,
  }: {
    params:
      Promise<Params>;
  },
) {
  try {
    const apiKey =
      req.headers.get(
        "x-api-key",
      );

    if (
      !apiKey ||
      apiKey !==
        VALID_API_KEY
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const {
      driverId,
    } =
      await params;

    return NextResponse.json(
      getPaymentWalletMock(
        driverId,
      ),
      {
        status: 200,
      },
    );
  } catch (
    error
  ) {
    console.error(
      error,
    );

    return NextResponse.json(
      {
        message:
          "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
