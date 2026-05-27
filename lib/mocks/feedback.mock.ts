import type { FeedbackReviewResponse } from "@/types/dashboard";

export const feedbackReviewMock: FeedbackReviewResponse = {
  id: 5,
  nombre: "Juan",
  apellido: "Perez",
  valoracion: 4.8,
  reviews: [],
};

export function getFeedbackUserRatingMock(
  userId: string,
): FeedbackReviewResponse {
  return {
    ...feedbackReviewMock,
    id: Number.isNaN(Number(userId))
      ? feedbackReviewMock.id
      : Number(userId),
  };
}

export type ReportResponse = {
  message: string;
  idReporte: number;
  vinculos: {
    reportante: string;
    reportado: string;
  };
  estado: "SinResolver" | "Resuelto";
};

export function createReportMock(
  idTrabajo: number,
  idReportante: number,
  idReportado: number
) {
  return {
    message: "Reporte creado exitosamente",
    idReporte: Math.floor(Math.random() * 1000),
    vinculos: {
      reportante: `Mock Reportante ${idReportante}`,
      reportado: `Mock Reportado ${idReportado}`,
    },
    estado: "SinResolver",
  };
}

export type ReviewsUserResponse = {
  status: "ReadyToRate";
  datosDelTrabajo: {
    idTrabajo: string;
    tipoDeTrabajo: string;
    cliente: { id: number; nombre: string };
    trabajador: { id: number; nombre: string };
  };
};

export function createReviewsUserMock(idTrabajo: string): ReviewsUserResponse {
  return {
    status: "ReadyToRate",
    datosDelTrabajo: {
      idTrabajo,
      tipoDeTrabajo: "Flete",
      cliente: { id: 10, nombre: "Juan" },
      trabajador: { id: 1, nombre: "Sebastian" },
    },
  };
}
