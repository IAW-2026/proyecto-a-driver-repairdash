import type { FeedbackReviewResponse } from "@/types/dashboard";

export const feedbackReviewMock: FeedbackReviewResponse = {
  id: 5,
  nombre: "Juan",
  apellido: "Perez",
  valoracion: 4.8,
  reviews: [],
};

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
