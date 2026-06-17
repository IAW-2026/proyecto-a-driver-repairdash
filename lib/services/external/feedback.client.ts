import type { FeedbackReviewResponse } from "@/types/dashboard";

type FeedbackPublicReportsResponse = {
  idUsuario: string;
  reportesAbiertos: number;
  reportesConFalloEnContra: number;
};

type FeedbackTrabajoResponse = {
  Idtrabajo: string;
  IdCliente: string;
  IdTrabajador: string;
  tipodeTrabajo: string;
  fechaDeInicio: string;
};

type FeedbackReportResponse = {
  message: string;
  idReporte: number;
  vinculos: {
    reportante: string;
    reportado: string;
  };
  estado: "SinResolver" | "Resuelto";
};

type ReviewsUserResponse = {
  status: "ReadyToRate";
  datosDelTrabajo: {
    idTrabajo: string;
    tipoDeTrabajo: string;
    cliente: {
      id: number;
      nombre: string;
    };
    trabajador: {
      id: number;
      nombre: string;
    };
  };
};

function getFeedbackBaseUrl() {
  const configuredUrl =
    process.env.FEEDBACK_APP_URL;

  if (!configuredUrl) {
    return null;
  }

  const baseUrl =
    configuredUrl.replace(
      /\/+$/,
      "",
    );

  if (
    baseUrl.endsWith("/api")
  ) {
    return baseUrl;
  }

  return `${baseUrl}/api`;
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
  url: string | null;
}): Promise<T> {
  if (!url) {
    console.warn(
      "FEEDBACK_APP_URL is not configured; using safe fallback",
    );

    return fallback();
  }

  try {
    const response = await fetch(url, init);

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    console.warn(
      "Feedback API returned",
      response.status,
      "using safe fallback",
    );
  } catch (error) {
    console.warn(
      "Feedback API unavailable, using safe fallback",
      error,
    );
  }

  return fallback();
}

function unavailableFeedback(
  userId: string,
): FeedbackReviewResponse {
  return {
    id: Number.isNaN(Number(userId))
      ? 0
      : Number(userId),
    nombre: "No disponible",
    apellido: "",
    valoracion: 0,
    reviews: [],
  };
}

export async function getDriverFeedback(
  userId: string,
): Promise<FeedbackReviewResponse> {
  const fallback =
    unavailableFeedback(userId);

  const baseUrl =
    getFeedbackBaseUrl();

  const feedback =
    await fetchWithFallback({
      url: baseUrl
        ? `${baseUrl}/reviews/user/${userId}`
        : null,
      init: {
        headers: getFeedbackHeaders(),
        next: {
          revalidate: 60,
        },
      },
      fallback: () => fallback,
    });

  const valoracion =
    Number(
      feedback.valoracion,
    );

  if (
    !Number.isFinite(
      valoracion,
    ) ||
    valoracion <= 0
  ) {
    return fallback;
  }

  return {
    ...feedback,
    valoracion,
  };
}

export async function getFeedbackPublicReports(
  userId: string,
): Promise<FeedbackPublicReportsResponse> {
  const baseUrl =
    getFeedbackBaseUrl();

  return fetchWithFallback({
    url: baseUrl
      ? `${baseUrl}/reports/public/${userId}`
      : null,
    init: {
      headers: getFeedbackHeaders(),
      next: {
        revalidate: 60,
      },
    },
    fallback: () => ({
      idUsuario: userId,
      reportesAbiertos: 0,
      reportesConFalloEnContra: 0,
    }),
  });
}

export async function createFeedbackTrabajo(input: {
  idTrabajo: string;
  idCliente: string;
  idTrabajador: string;
  tipoDeTrabajo: string;
}): Promise<FeedbackTrabajoResponse> {
  const baseUrl =
    getFeedbackBaseUrl();

  return fetchWithFallback({
    url: baseUrl
      ? `${baseUrl}/trabajos`
      : null,
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
    fallback: () => ({
      Idtrabajo: input.idTrabajo,
      IdCliente: input.idCliente,
      IdTrabajador: input.idTrabajador,
      tipodeTrabajo: input.tipoDeTrabajo,
      fechaDeInicio: "",
    }),
  });
}

export async function createFeedbackReport(input: {
  idTrabajo: string;
  idReportante: string;
  idReportado: string;
}): Promise<FeedbackReportResponse> {
  const baseUrl =
    getFeedbackBaseUrl();

  return fetchWithFallback({
    url: baseUrl
      ? `${baseUrl}/reports`
      : null,
    init: {
      method: "POST",
      headers: getFeedbackHeaders(),
      body: JSON.stringify(input),
    },
    fallback: () => ({
      message:
        "FeedbackApp no disponible; reporte no confirmado externamente",
      idReporte: 0,
      vinculos: {
        reportante:
          input.idReportante,
        reportado:
          input.idReportado,
      },
      estado: "SinResolver",
    }),
  });
}

export async function requestFeedbackReview(
  idTrabajo: string,
): Promise<ReviewsUserResponse> {
  const baseUrl =
    getFeedbackBaseUrl();

  return fetchWithFallback({
    url: baseUrl
      ? `${baseUrl}/reviews/user`
      : null,
    init: {
      method: "POST",
      headers: getFeedbackHeaders(),
      body: JSON.stringify({
        idTrabajo,
      }),
    },
    fallback: () => ({
      status: "ReadyToRate",
      datosDelTrabajo: {
        idTrabajo,
        tipoDeTrabajo: "No disponible",
        cliente: {
          id: 0,
          nombre: "No disponible",
        },
        trabajador: {
          id: 0,
          nombre: "No disponible",
        },
      },
    }),
  });
}
