import {
  NextResponse,
} from "next/server";

import {
  paymentWalletMock,
} from "@/lib/mocks/payments.mock";

type Params = {
  driverId:
    string;
};

export async function GET(
  _req: Request,
  {
    params,
  }: {
    params:
      Promise<Params>;
  },
) {
  try {
    const {
      driverId,
    } =
      await params;

    return NextResponse.json(
      {
        ...paymentWalletMock,

        driverId,
      },
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