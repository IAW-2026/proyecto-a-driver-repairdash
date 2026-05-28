import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return NextResponse.json(
    {
      message: "Unauthorized",
    },
    {
      status: 401,
    },
  );
}

export function validateInternalApiKey(
  req: NextRequest,
  expectedApiKey = process.env.DRIVER_API_KEY,
): NextResponse | null {
  if (!expectedApiKey) {
    console.error("INTERNAL_AUTH_NOT_CONFIGURED");

    return NextResponse.json(
      {
        message: "Internal auth not configured",
      },
      {
        status: 500,
      },
    );
  }

  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== expectedApiKey) {
    return unauthorized();
  }

  return null;
}

export function validateAnyInternalApiKey(
  req: NextRequest,
  expectedApiKeys: Array<string | undefined>,
): NextResponse | null {
  const configuredApiKeys = expectedApiKeys.filter(
    (apiKey): apiKey is string => Boolean(apiKey),
  );

  if (configuredApiKeys.length === 0) {
    console.error("INTERNAL_AUTH_NOT_CONFIGURED");

    return NextResponse.json(
      {
        message: "Internal auth not configured",
      },
      {
        status: 500,
      },
    );
  }

  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || !configuredApiKeys.includes(apiKey)) {
    return unauthorized();
  }

  return null;
}
