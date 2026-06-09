import {
  Prisma,
  TrabajoEstado,
} from "@prisma/client";
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  validateControlPlaneApiKey,
} from "@/lib/control-plane/auth";
import {
  parseMutationActor,
  readBodyObject,
} from "@/lib/control-plane/mutations";
import {
  serializeServiceType,
} from "@/lib/control-plane/serializers";
import { prisma } from "@/lib/prisma";

export const dynamic =
  "force-dynamic";

const serviceTypeInclude = {
  driverServicios: {
    select: {
      id: true,
    },
  },
  trabajos: {
    where: {
      estado: {
        notIn: [
          TrabajoEstado.FINALIZADO,
          TrabajoEstado.CANCELADO,
        ],
      },
    },
    select: {
      id: true,
    },
  },
} satisfies Prisma.TipoServicioInclude;

function readPatchPayload(
  body: Record<string, unknown>,
) {
  const data: Prisma.TipoServicioUpdateInput =
    {};

  if (
    typeof body.nombre ===
    "string"
  ) {
    const nombre =
      body.nombre.trim();

    if (!nombre) {
      return null;
    }

    data.nombre = nombre;
  }

  if (
    typeof body.descripcion ===
    "string"
  ) {
    const descripcion =
      body.descripcion.trim();

    if (!descripcion) {
      return null;
    }

    data.descripcion =
      descripcion;
  }

  if (
    body.precioBase !==
    undefined
  ) {
    const precioBase =
      Number(body.precioBase);

    if (
      !Number.isFinite(
        precioBase,
      ) ||
      precioBase <= 0
    ) {
      return null;
    }

    data.precioBase =
      precioBase;
  }

  if (
    Object.keys(data)
      .length === 0
  ) {
    return null;
  }

  return data;
}

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const authError =
    validateControlPlaneApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const { id } =
    await context.params;

  const service =
    await prisma.tipoServicio.findUnique({
      where: {
        id,
      },
      include: serviceTypeInclude,
    });

  if (!service) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Tipo de servicio no encontrado",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    status: "success",
    data: serializeServiceType(
      service,
    ),
  });
}

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const authError =
    validateControlPlaneApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const body =
    readBodyObject(
      await req.json().catch(
        () => null,
      ),
    );

  if (!body) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Body JSON invalido",
      },
      {
        status: 400,
      },
    );
  }

  const actorResult =
    parseMutationActor(body);

  if (!actorResult.ok) {
    return actorResult.response;
  }

  const payload =
    readPatchPayload(body);

  if (!payload) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Enviar al menos uno de: nombre, descripcion, precioBase",
      },
      {
        status: 400,
      },
    );
  }

  const { id } =
    await context.params;

  const service =
    await prisma.tipoServicio.update({
      where: {
        id,
      },
      data: payload,
      include: serviceTypeInclude,
    }).catch((error: unknown) => {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        (
          error.code === "P2025" ||
          error.code === "P2002"
        )
      ) {
        return null;
      }

      throw error;
    });

  if (!service) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "No se pudo actualizar el tipo de servicio",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    status: "success",
    data: serializeServiceType(
      service,
    ),
  });
}

export async function DELETE(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const authError =
    validateControlPlaneApiKey(
      req,
    );

  if (authError) {
    return authError;
  }

  const body =
    readBodyObject(
      await req.json().catch(
        () => null,
      ),
    );

  if (!body) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Body JSON invalido",
      },
      {
        status: 400,
      },
    );
  }

  const actorResult =
    parseMutationActor(body);

  if (!actorResult.ok) {
    return actorResult.response;
  }

  const { id } =
    await context.params;

  const deleted =
    await prisma.tipoServicio.delete({
      where: {
        id,
      },
    }).catch(() => null);

  if (!deleted) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "No se pudo eliminar el tipo de servicio",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    status: "success",
    data: {
      id: deleted.id,
    },
  });
}

