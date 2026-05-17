"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/roles";

export async function createServiceType(
  formData: FormData,
) {
  await requireAdmin();

  const nombre =
    formData
      .get("nombre")
      ?.toString()
      .trim();

  const descripcion =
    formData
      .get(
        "descripcion",
      )
      ?.toString()
      .trim();

  const precioBase =
    Number(
      formData.get(
        "precioBase",
      ),
    );

  if (
    !nombre ||
    !descripcion ||
    Number.isNaN(
      precioBase,
    )
  ) {
    throw new Error(
      "Datos inválidos",
    );
  }

  await prisma.tipoServicio.create(
    {
      data: {
        nombre,
        descripcion,
        precioBase,
      },
    },
  );

  revalidatePath(
    "/admin/servicios",
  );
}

export async function deleteServiceType(
  id: string,
) {
  await requireAdmin();

  await prisma.tipoServicio.delete(
    {
      where: {
        id,
      },
    },
  );

  revalidatePath(
    "/admin/servicios",
  );
}

export async function updateServiceType(
  id: string,
  formData: FormData,
) {
  await requireAdmin();

  const nombre =
    formData
      .get("nombre")
      ?.toString()
      .trim();

  const descripcion =
    formData
      .get(
        "descripcion",
      )
      ?.toString()
      .trim();

  const precioBase =
    Number(
      formData.get(
        "precioBase",
      ),
    );

  if (
    !nombre ||
    !descripcion ||
    Number.isNaN(
      precioBase,
    )
  ) {
    throw new Error(
      "Datos inválidos",
    );
  }

  await prisma.tipoServicio.update(
    {
      where: {
        id,
      },
      data: {
        nombre,
        descripcion,
        precioBase,
      },
    },
  );

  revalidatePath(
    "/admin/servicios",
  );
}