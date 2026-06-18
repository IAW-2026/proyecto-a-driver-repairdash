import {
  NextRequest,
  NextResponse,
} from "next/server";

export function validateAnalyticsApiKey(
  req: NextRequest,
) {
  const expectedApiKey =
    process.env
      .ANALYTICS_API_KEY;

  if (!expectedApiKey) {
    console.error(
      "ANALYTICS_AUTH_NOT_CONFIGURED",
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Analytics auth not configured",
      },
      {
        status: 500,
      },
    );
  }

  const apiKey =
    req.headers.get(
      "x-analytics-api-key",
    );

  if (
    !apiKey ||
    apiKey !== expectedApiKey
  ) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  return null;
}
