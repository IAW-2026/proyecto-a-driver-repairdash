import { getBaseUrl } from "@/lib/config/get-base-url";
import {
  createFeedbackReportMock,
  createFeedbackTrabajoMock,
  createReviewsUserMock,
  getFeedbackPublicReportsMock,
  getFeedbackUserRatingMock,
} from "@/lib/mocks/feedback.mock";
import type {
  FeedbackPublicReportsResponse,
  FeedbackReportResponse,
  FeedbackTrabajoResponse,
} from "@/lib/mocks/feedback.mock";
import type { FeedbackReviewResponse } from "@/types/dashboard";

function getFeedbackBaseUrl() {
  return (
    process.env.FEEDBACK_APP_URL ??
    `${getBaseUrl()}/api/mocks/feedback`
  ).replace(/\/+$/, "");
}

function getFeedbackHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": process.env.FEEDBACK_INTERNAL_API_KEY ?? "",
  };
}

async function fetchWithFallback<T>({
  fallback,
  init,
  url,
}: {
  fallback: () => T;
  init?: RequestInit;
  url: string;
}): Promise<T> {
  try {
    const response = await fetch(url, init);

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    console.warn(
      "Feedback API returned",
      response.status,
      "using local fallback",
    );
  } catch (error) {
    console.warn(
      "Feedback API unavailable, using local fallback",
      error,
    );
  }

  return fallback();
}

export async function getDriverFeedback(
  userId: string,
): Promise<FeedbackReviewResponse> {
  return fetchWithFallback({
    url: `${getFeedbackBaseUrl()}/reviews/user/${userId}`,
    init: {
      headers: getFeedbackHeaders(),
      next: {
        revalidate: 60,
      },
    },
    fallback: () => getFeedbackUserRatingMock(userId),
  });
}

export async function getFeedbackPublicReports(
  userId: string,
): Promise<FeedbackPublicReportsResponse> {
  return fetchWithFallback({
    url: `${getFeedbackBaseUrl()}/reports/public/${userId}`,
    init: {
      headers: getFeedbackHeaders(),
      next: {
        revalidate: 60,
      },
    },
    fallback: () => getFeedbackPublicReportsMock(userId),
  });
}

export async function createFeedbackTrabajo(input: {
  idTrabajo: string;
  idCliente: string;
  idTrabajador: string;
  tipoDeTrabajo: string;
}): Promise<FeedbackTrabajoResponse> {
  return fetchWithFallback({
    url: `${getFeedbackBaseUrl()}/trabajos`,
    init: {
      method: "POST",
      headers: getFeedbackHeaders(),
      body: JSON.stringify({
        Idtrabajo: input.idTrabajo,
        IdCliente: input.idCliente,
        IdTrabajador: input.idTrabajador,
        tipodeTrabajo: input.tipoDeTrabajo,
      }),
    },
    fallback: () =>
      createFeedbackTrabajoMock({
        Idtrabajo: input.idTrabajo,
        IdCliente: input.idCliente,
        IdTrabajador: input.idTrabajador,
        tipodeTrabajo: input.tipoDeTrabajo,
      }),
  });
}

export async function createFeedbackReport(input: {
  idTrabajo: string;
  idReportante: string;
  idReportado: string;
}): Promise<FeedbackReportResponse> {
  return fetchWithFallback({
    url: `${getFeedbackBaseUrl()}/reports`,
    init: {
      method: "POST",
      headers: getFeedbackHeaders(),
      body: JSON.stringify(input),
    },
    fallback: () =>
      createFeedbackReportMock(
        input.idTrabajo,
        input.idReportante,
        input.idReportado,
      ),
  });
}

export async function requestFeedbackReview(
  idTrabajo: string,
) {
  return fetchWithFallback({
    url: `${getFeedbackBaseUrl()}/reviews`,
    init: {
      method: "PUT",
      headers: getFeedbackHeaders(),
      body: JSON.stringify({
        idTrabajo,
      }),
    },
    fallback: () => createReviewsUserMock(idTrabajo),
  });
}
