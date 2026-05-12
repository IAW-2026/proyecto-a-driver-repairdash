export type DriverAvailability = "ONLINE" | "OFFLINE" | "EN_TRABAJO";

export type ServiceTypeDto = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
};

export type DriverDashboardProfile = {
  id: string;
  nombre: string;
  telefono: string | null;
  bio: string | null;
  imagenURL: string | null;
  status: DriverAvailability;
  role: "DRIVER" | "ADMIN";
  servicios: ServiceTypeDto[];
};

export type FeedbackReviewResponse = {
  id: number;
  nombre: string;
  apellido: string;
  valoracion: number;
  reviews: Array<{
    id: number;
    comentario: string;
    valoracion: number;
  }>;
};

export type PaymentDailySummary = {
  driverId: string;
  fecha: string;
  ingresosDelDia: number;
  moneda: "ARS";
  trabajosLiquidados: number;
};

export type RiderJobRequest = {
  id: string;
  idCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  ubicacion: {
    direccion: string;
    barrio: string;
  };
  tipoServicio: string;
  descripcion: string;
  fotos: string[];
  estado: "DISPONIBLE" | "ALTA_PRIORIDAD" | "PROGRAMADO";
};

export type DashboardJobRequest = RiderJobRequest & {
  precioEstimado: number;
};

export type DriverDailyStats = {
  trabajosCompletados: number;
  ingresosDelDia: number;
  ratingPromedio: number;
  tiempoConectado: string;
};
