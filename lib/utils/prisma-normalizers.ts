// lib/utils/prisma-normalizers.ts
import type { Trabajo, TipoServicio } from "@prisma/client";

export type TrabajoDto = Omit<Trabajo, "montoEstimado"> & {
  montoEstimado: number;
  tipoServicio: TipoServicioDto;
};

export type TipoServicioDto = Omit<TipoServicio, "precioBase"> & {
  precioBase: number;
};

export function normalizeTipoServicio(tipo: TipoServicio): TipoServicioDto {
  return {
    ...tipo,
    precioBase: Number(tipo.precioBase),
  };
}

export function normalizeTrabajo(trabajo: Trabajo & { tipoServicio: TipoServicio }): TrabajoDto {
  return {
    ...trabajo,
    montoEstimado: Number(trabajo.montoEstimado),
    tipoServicio: normalizeTipoServicio(trabajo.tipoServicio),
  };
}
export function normalizePhone(
  phone: string,
): string {
  // eliminar todo excepto números
  const digits =
    phone.replace(
      /\D/g,
      "",
    );

  // argentina:
  // +54 9 291 xxx xxxx
  // 54 9 291 ...
  // 291 ...
  // 0291 ...
  // 9 291 ...

  let normalized =
    digits;

  // sacar prefijo internacional
  if (
    normalized.startsWith(
      "54",
    )
  ) {
    normalized =
      normalized.slice(2);
  }

  // sacar el 9 móvil
  if (
    normalized.startsWith(
      "9",
    )
  ) {
    normalized =
      normalized.slice(1);
  }

  // sacar 0 inicial
  if (
    normalized.startsWith(
      "0",
    )
  ) {
    normalized =
      normalized.slice(1);
  }

  return normalized;
}