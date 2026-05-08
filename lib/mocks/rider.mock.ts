import type { RiderJobRequest } from "@/types/dashboard";

export const riderJobRequestsMock: RiderJobRequest[] = [
  {
    id: "request_001",
    idCliente: "rider_demo_001",
    nombreCliente: "Lucia",
    apellidoCliente: "Ramos",
    ubicacion: {
      direccion: "Av. Corrientes 1234",
      barrio: "Balvanera",
    },
    tipoServicio: "Plomeria",
    descripcion: "Perdida de agua bajo la cocina. Requiere revision urgente.",
    fotos: ["/window.svg"],
    estado: "ALTA_PRIORIDAD",
  },
  {
    id: "request_002",
    idCliente: "rider_demo_002",
    nombreCliente: "Mateo",
    apellidoCliente: "Sosa",
    ubicacion: {
      direccion: "San Martin 850",
      barrio: "Microcentro",
    },
    tipoServicio: "Electricidad",
    descripcion: "Corte parcial de energia en living y cocina.",
    fotos: ["/globe.svg"],
    estado: "DISPONIBLE",
  },
  {
    id: "request_003",
    idCliente: "rider_demo_003",
    nombreCliente: "Carla",
    apellidoCliente: "Benitez",
    ubicacion: {
      direccion: "Juncal 2200",
      barrio: "Recoleta",
    },
    tipoServicio: "Gas",
    descripcion: "Revision preventiva de calefon y conexion principal.",
    fotos: ["/file.svg"],
    estado: "PROGRAMADO",
  },
];
