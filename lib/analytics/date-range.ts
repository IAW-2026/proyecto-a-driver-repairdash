import type {
  NextRequest,
} from "next/server";

const DAY_MS =
  24 * 60 * 60 * 1000;
const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;

export type AnalyticsDateRange =
  {
    from: Date;
    to: Date;
    fromKey: string;
    toKey: string;
  };

type DateRangeResult =
  | {
      ok: true;
      range: AnalyticsDateRange;
    }
  | {
      ok: false;
      message: string;
    };

function dateKey(
  date: Date,
) {
  return date
    .toISOString()
    .slice(0, 10);
}

function startOfUtcDay(
  date: Date,
) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

function endOfUtcDay(
  date: Date,
) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function parseDateParam(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      value,
    )
  ) {
    return undefined;
  }

  const date =
    new Date(
      `${value}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return date;
}

export function getAnalyticsDateRange(
  req: NextRequest,
): DateRangeResult {
  const fromParam =
    parseDateParam(
      req.nextUrl.searchParams.get(
        "from",
      ),
    );

  const toParam =
    parseDateParam(
      req.nextUrl.searchParams.get(
        "to",
      ),
    );

  if (
    fromParam === undefined ||
    toParam === undefined
  ) {
    return {
      ok: false,
      message:
        "Formato de fecha invalido. Usar YYYY-MM-DD.",
    };
  }

  const now =
    new Date();
  const to =
    endOfUtcDay(
      toParam ?? now,
    );

  const from =
    startOfUtcDay(
      fromParam ??
        new Date(
          to.getTime() -
            (DEFAULT_DAYS - 1) *
              DAY_MS,
        ),
    );

  if (
    from.getTime() >
    to.getTime()
  ) {
    return {
      ok: false,
      message:
        "El parametro from no puede ser posterior a to.",
    };
  }

  if (
    to.getTime() -
      from.getTime() >
    MAX_DAYS * DAY_MS
  ) {
    return {
      ok: false,
      message:
        "El rango maximo permitido es de 365 dias.",
    };
  }

  return {
    ok: true,
    range: {
      from,
      to,
      fromKey:
        dateKey(from),
      toKey:
        dateKey(to),
    },
  };
}

export function getDayKey(
  date: Date,
) {
  return date
    .toISOString()
    .slice(0, 10);
}

export function buildDailyBuckets(
  range: AnalyticsDateRange,
) {
  const buckets: string[] =
    [];
  const cursor =
    startOfUtcDay(
      range.from,
    );

  while (
    cursor.getTime() <=
    range.to.getTime()
  ) {
    buckets.push(
      getDayKey(cursor),
    );
    cursor.setUTCDate(
      cursor.getUTCDate() +
        1,
    );
  }

  return buckets;
}
