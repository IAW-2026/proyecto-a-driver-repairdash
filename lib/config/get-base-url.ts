export function getBaseUrl() {
  const explicitUrl =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL;

  if (explicitUrl) {
    return normalizeBaseUrl(
      explicitUrl,
    );
  }

  const vercelUrl =
    process.env
      .VERCEL_PROJECT_PRODUCTION_URL ??
    process.env
      .VERCEL_BRANCH_URL ??
    process.env
      .VERCEL_URL;

  if (
    vercelUrl
  ) {
    return normalizeBaseUrl(
      vercelUrl,
    );
  }

  return "http://localhost:3000";
}

function normalizeBaseUrl(
  url: string,
) {
  const trimmedUrl =
    url.trim();

  const baseUrl =
    trimmedUrl.startsWith(
      "http://",
    ) ||
    trimmedUrl.startsWith(
      "https://",
    )
      ? trimmedUrl
      : `https://${trimmedUrl}`;

  return baseUrl.replace(
    /\/+$/,
    "",
  );
}
