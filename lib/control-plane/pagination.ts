import type {
  NextRequest,
} from "next/server";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function readPositiveInt(
  value: string | null,
  fallback: number,
) {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

export function getPaginationParams(
  req: NextRequest,
) {
  const page =
    readPositiveInt(
      req.nextUrl.searchParams.get(
        "page",
      ),
      DEFAULT_PAGE,
    );

  const requestedLimit =
    readPositiveInt(
      req.nextUrl.searchParams.get(
        "limit",
      ),
      DEFAULT_LIMIT,
    );

  const limit =
    Math.min(
      requestedLimit,
      MAX_LIMIT,
    );

  return {
    page,
    limit,
    skip:
      (page - 1) *
      limit,
  };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(
          total / limit,
        ),
      hasNextPage:
        page * limit < total,
      hasPreviousPage:
        page > 1,
    },
  };
}

