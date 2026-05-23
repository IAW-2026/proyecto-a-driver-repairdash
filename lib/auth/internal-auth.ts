import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

function isValidSha256Hash(
  value: string,
): boolean {
  return /^[a-f0-9]{64}$/i.test(
    value,
  );
}

function sha256(
  value: string,
): Buffer {
  return Buffer.from(
    crypto
      .createHash("sha256")
      .update(value.trim())
      .digest("hex"),
    "utf8",
  );
}

export function validateInternalApiKey(
  req: NextRequest,
  expectedHash?: string,
): NextResponse | null {
  if (!expectedHash) {
    console.error(
      "INTERNAL_AUTH_NOT_CONFIGURED",
    );

    return NextResponse.json(
      {
        message:
          "Internal auth not configured",
      },
      {
        status: 500,
      },
    );
  }

  if (
    !isValidSha256Hash(
      expectedHash,
    )
  ) {
    console.error(
      "INVALID_INTERNAL_API_KEY_HASH_FORMAT",
    );

    return NextResponse.json(
      {
        message:
          "Invalid API key hash format",
      },
      {
        status: 500,
      },
    );
  }

  const apiKey =
    req.headers.get(
      "x-api-key",
    );

  if (!apiKey) {
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

  const receivedHash =
    sha256(apiKey);

  const expectedHashBuffer =
    Buffer.from(
      expectedHash,
      "utf8",
    );

  const isValid =
    crypto.timingSafeEqual(
      receivedHash,
      expectedHashBuffer,
    );

  if (!isValid) {
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

  return null;
}