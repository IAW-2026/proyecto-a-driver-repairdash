import type { ServiceTypeDto } from "@/types/dashboard";

export const serviceTypesMock: ServiceTypeDto[] = [
  {
    id: "service_plomeria",
    nombre: "Plomeria",
    descripcion: "Reparaciones de canerias, griferia y sanitarios.",
    precioBase: 25000,
  },
  {
    id: "service_electricidad",
    nombre: "Electricidad",
    descripcion: "Instalaciones, tomas, tableros y diagnostico electrico.",
    precioBase: 30000,
  },
  {
    id: "service_gas",
    nombre: "Gas",
    descripcion: "Revision de conexiones, artefactos y perdidas.",
    precioBase: 40000,
  },
  {
    id: "service_aire",
    nombre: "Aire acondicionado",
    descripcion: "Instalacion, limpieza y mantenimiento de equipos split.",
    precioBase: 35000,
  },
];
