import type {
  Driver,
  TipoServicio,
  Trabajo,
} from "@prisma/client";

type DecimalLike = {
  toNumber: () => number;
};

export function serializeMoney(
  value: DecimalLike,
) {
  return value.toNumber();
}

export function serializeDriver(
  driver: Driver & {
    tiposServicio?: Array<{
      tipoServicio: Pick<
        TipoServicio,
        "id" | "nombre"
      >;
    }>;
  },
) {
  return {
    id: driver.id,
    clerkUserId:
      driver.clerkUserId,
    nombre: driver.nombre,
    email: driver.email,
    telefono:
      driver.telefono,
    imagenURL:
      driver.imagenURL,
    bio: driver.bio,
    role: driver.role,
    status:
      driver.status,
    onboardingCompleto:
      driver.onboardingCompleto,
    tiposServicio:
      driver.tiposServicio?.map(
        (item) => ({
          id: item.tipoServicio.id,
          nombre:
            item.tipoServicio
              .nombre,
        }),
      ) ?? [],
    creadoEn:
      driver.creadoEn.toISOString(),
    actualizadoEn:
      driver.actualizadoEn.toISOString(),
  };
}

export function serializeTrabajo(
  trabajo: Trabajo & {
    driver:
      | Pick<
          Driver,
          | "id"
          | "clerkUserId"
          | "nombre"
          | "email"
        >
      | null;
    tipoServicio: Pick<
      TipoServicio,
      "id" | "nombre"
    >;
  },
) {
  return {
    id: trabajo.id,
    estado:
      trabajo.estado,
    rider: {
      clerkUserId:
        trabajo.riderId,
      nombre:
        trabajo.nombreRider,
      apellido:
        trabajo.apellidoRider,
      valoracion:
        trabajo.valoracionRider,
    },
    driver: trabajo.driver
      ? {
          id: trabajo.driver.id,
          clerkUserId:
            trabajo.driver
              .clerkUserId,
          nombre:
            trabajo.driver.nombre,
          email:
            trabajo.driver.email,
        }
      : null,
    tipoServicio: {
      id: trabajo.tipoServicio.id,
      nombre:
        trabajo.tipoServicio
          .nombre,
    },
    descripcion:
      trabajo.descripcion,
    direccion:
      trabajo.direccion,
    fotos: trabajo.fotos,
    montoEstimado:
      serializeMoney(
        trabajo.montoEstimado,
      ),
    creadoEn:
      trabajo.creadoEn.toISOString(),
    actualizadoEn:
      trabajo.actualizadoEn.toISOString(),
  };
}

export function serializeServiceType(
  service: TipoServicio & {
    driverServicios?: unknown[];
    trabajos?: unknown[];
  },
) {
  return {
    id: service.id,
    nombre: service.nombre,
    descripcion:
      service.descripcion,
    precioBase:
      serializeMoney(
        service.precioBase,
      ),
    driversAsignados:
      service.driverServicios
        ?.length ?? 0,
    trabajosActivos:
      service.trabajos?.length ??
      0,
    creadoEn:
      service.creadoEn.toISOString(),
    actualizadoEn:
      service.actualizadoEn.toISOString(),
  };
}

