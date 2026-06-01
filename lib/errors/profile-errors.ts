import {
  Prisma,
} from "@prisma/client";

export const PHONE_UNAVAILABLE_MESSAGE =
  "El numero de telefono no esta disponible.";

export function isUniquePhoneError(
  error: unknown,
) {
  if (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target =
      error.meta?.target;

    return (
      Array.isArray(target) &&
      target.includes(
        "telefonoNormalizado",
      )
    );
  }

  return false;
}
