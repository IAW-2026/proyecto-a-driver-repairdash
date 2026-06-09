import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  DriverStatus,
  UserRole,
} from "@prisma/client";

type ClerkEvent = {
  type: string;
  data: ClerkUserData;
};

type ClerkUserData = {
  id?: string;
  public_metadata?: {
    role?: unknown;
  };
  email_addresses?: Array<{
    email_address?: string;
  }>;
  first_name?: string | null;
  phone_numbers?: Array<{
    phone_number?: string;
  }>;
  image_url?: string | null;
};

const DRIVER_ROLE =
  "driver";

export async function POST(
  req: Request,
) {
  const WEBHOOK_SECRET =
    process.env
      .CLERK_WEBHOOK_SECRET?.trim();

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { ok: false },
      { status: 500 },
    );
  }

  // -----------------------
  // HEADERS SVIX
  // -----------------------

  const headerPayload =
    await headers();

  const svixId =
    headerPayload.get(
      "svix-id",
    );

  const svixTimestamp =
    headerPayload.get(
      "svix-timestamp",
    );

  const svixSignature =
    headerPayload.get(
      "svix-signature",
    );

  if (
    !svixId ||
    !svixTimestamp ||
    !svixSignature
  ) {
    return NextResponse.json(
      { ok: false },
      { status: 400 },
    );
  }

  // -----------------------
  // VERIFY WEBHOOK
  // -----------------------

  const payload =
    await req.text();

  let evt: ClerkEvent;

  try {
    const wh =
      new Webhook(
        WEBHOOK_SECRET,
      );

    evt = wh.verify(
      payload,
      {
        "svix-id":
          svixId,
        "svix-timestamp":
          svixTimestamp,
        "svix-signature":
          svixSignature,
      },
    ) as ClerkEvent;
  } catch (error) {
    console.error(
      "SVIX ERROR:",
      error,
    );

    return NextResponse.json(
      { ok: false },
      { status: 400 },
    );
  }

  // ==================================================
  // SOLO USER.UPDATED
  // ==================================================

  if (
    evt.type !==
    "user.updated"
  ) {
    return NextResponse.json(
      {
        ok: true,
        message:
          "Evento ignorado",
      },
    );
  }

  const user =
    evt.data;

  const clerkUserId =
    user.id;

  if (!clerkUserId) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Usuario Clerk sin id",
      },
      {
        status: 400,
      },
    );
  }

  const role =
    user.public_metadata
      ?.role;

  // Solo sincronizamos drivers
  if (
    role !==
    DRIVER_ROLE
  ) {
    return NextResponse.json(
      {
        ok: true,
        message:
          "Usuario no driver ignorado",
      },
    );
  }

  const email =
    user.email_addresses?.[0]
      ?.email_address ?? "";

  const nombre =
    user.first_name ??
    "Usuario";

  const telefono =
    user.phone_numbers?.[0]
      ?.phone_number ??
    null;

  const imagenURL =
    user.image_url ??
    null;

  try {
    await prisma.driver.upsert(
      {
        where: {
          clerkUserId,
        },

        update: {
          nombre,
          email,
          telefono,
        },

        create: {
          clerkUserId,
          nombre,
          email,
          telefono,
          imagenURL,
          role:
            UserRole.DRIVER,
          status:
            DriverStatus.OFFLINE,
        },
      },
    );

    return NextResponse.json(
      {
        ok: true,
        message:
          "Driver sincronizado",
      },
    );
  } catch (error: unknown) {
    console.error(
      "WEBHOOK ERROR:",
      error,
    );

    const errorRecord =
      typeof error ===
        "object" &&
      error !== null
        ? (error as {
            code?: unknown;
            meta?: unknown;
          })
        : {};

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error interno",
        code:
          errorRecord.code,
        meta:
          errorRecord.meta,
        stack:
          process.env
            .NODE_ENV ===
            "development" &&
          error instanceof Error
            ? error.stack
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
