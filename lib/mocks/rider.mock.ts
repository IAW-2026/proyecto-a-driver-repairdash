import type { RiderJobRequest } from "@/types/dashboard";

export type RiderCustomerMock = {
  idCliente: string;
  nombreCliente: string;
  apellidoCliente: string;
  ratingCliente: number;
};

const riderCustomersMock: RiderCustomerMock[] = [
  {
    idCliente: "rider_demo_001",
    nombreCliente: "Lucia",
    apellidoCliente: "Ramos",
    ratingCliente: 4.8,
  },
  {
    idCliente: "rider_demo_002",
    nombreCliente: "Mateo",
    apellidoCliente: "Sosa",
    ratingCliente: 4.5,
  },
  {
    idCliente: "rider_demo_003",
    nombreCliente: "Carla",
    apellidoCliente: "Benitez",
    ratingCliente: 4.9,
  },
  {
    idCliente: "user_rider_test_001",
    nombreCliente: "Juan",
    apellidoCliente: "Perez",
    ratingCliente: 4.8,
  },
];

const repairPhotoMocks = {
  plomeria: [
    "https://picsum.photos/seed/repairdash-plumbing-1/900/675",
    "https://picsum.photos/seed/repairdash-plumbing-2/900/675",
  ],
  electricidad: [
    "https://picsum.photos/seed/repairdash-electric-1/900/675",
    "https://picsum.photos/seed/repairdash-electric-2/900/675",
    "https://picsum.photos/seed/repairdash-electric-3/900/675",
  ],
  gas: [
    "https://picsum.photos/seed/repairdash-gas-1/900/675",
  ],
};

export const riderJobRequestsMock: RiderJobRequest[] = [
  {
    id: "request_001",
    idCliente: "rider_demo_001",
    nombreCliente: "Lucia",
    apellidoCliente: "Ramos",
    ratingCliente: 4.8,
    ubicacion: {
      direccion: "Av. Corrientes 1234",
      barrio: "Balvanera",
    },
    tipoServicio: "Plomeria",
    descripcion: "Perdida de agua bajo la cocina. Requiere revision urgente.",
    fotos:
      repairPhotoMocks.plomeria,
    estado: "ALTA_PRIORIDAD",
  },
  {
    id: "request_002",
    idCliente: "rider_demo_002",
    nombreCliente: "Mateo",
    apellidoCliente: "Sosa",
    ratingCliente: 4.5,
    ubicacion: {
      direccion: "San Martin 850",
      barrio: "Microcentro",
    },
    tipoServicio: "Electricidad",
    descripcion: "Corte parcial de energia en living y cocina.",
    fotos:
      repairPhotoMocks.electricidad,
    estado: "DISPONIBLE",
  },
  {
    id: "request_003",
    idCliente: "rider_demo_003",
    nombreCliente: "Carla",
    apellidoCliente: "Benitez",
    ratingCliente: 4.9,
    ubicacion: {
      direccion: "Juncal 2200",
      barrio: "Recoleta",
    },
    tipoServicio: "Gas",
    descripcion: "Revision preventiva de calefon y conexion principal.",
    fotos:
      repairPhotoMocks.gas,
    estado: "PROGRAMADO",
  },
];

export function getRiderCustomerMock(
  riderId: string,
): RiderCustomerMock {
  return (
    riderCustomersMock.find(
      (customer) =>
        customer.idCliente ===
        riderId,
    ) ?? {
      idCliente: riderId,
      nombreCliente: "Cliente",
      apellidoCliente: "Demo",
      ratingCliente: 4.6,
    }
  );
}
