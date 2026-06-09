import {
  NextRequest,
  NextResponse,
} from "next/server";

export function validateControlPlaneApiKey(
  req: NextRequest,
) {
  const expectedApiKey =
    process.env
      .CONTROL_PLANE_API_KEY;

  if (!expectedApiKey) {
    console.error(
      "CONTROL_PLANE_AUTH_NOT_CONFIGURED",
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Control Plane auth not configured",
      },
      {
        status: 500,
      },
    );
  }

  const apiKey =
    req.headers.get(
      "x-control-plane-api-key",
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

