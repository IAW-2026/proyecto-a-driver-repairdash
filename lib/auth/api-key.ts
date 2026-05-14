import { NextRequest } from "next/server";

export function validateApiKey(
  req: NextRequest,
  allowedKeys: string[],
) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return false;
  }

  return allowedKeys.includes(apiKey);
}