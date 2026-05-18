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
  data: any;
};

export async function POST(
  req: Request,
) {
  const WEBHOOK_SECRET =
    process.env
      .CLERK_WEBHOOK_SECRET;

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

  const wh =
    new Webhook(
      WEBHOOK_SECRET,
    );

  let evt: ClerkEvent;

  try {
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

  const user =
    evt.data;

  const clerkUserId =
    user.id;

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

  const role =
    user.public_metadata
      ?.role;

  try {
    // ==================================================
    // USER CREATED
    // ==================================================

    if (
      evt.type ===
      "user.created"
    ) {
      // Solo drivers
      if (
        role !==
        "driver"
      ) {
        return NextResponse.json(
          {
            ok: true,
            message:
              "Usuario ignorado",
          },
        );
      }

      await prisma.driver.upsert(
        {
          where: {
            clerkUserId,
          },
          update: {
            nombre,
            email,
            telefono,
            imagenURL,
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
            "Driver creado",
        },
      );
    }

    // ==================================================
    // USER UPDATED
    // ==================================================

    if (
      evt.type ===
      "user.updated"
    ) {
      const existingDriver =
        await prisma.driver.findUnique(
          {
            where: {
              clerkUserId,
            },
          },
        );

      // Si no existe driver,
      // ignoramos update
      if (
        !existingDriver
      ) {
        return NextResponse.json(
          {
            ok: true,
            message:
              "Usuario ignorado",
          },
        );
      }

      await prisma.driver.update(
        {
          where: {
            clerkUserId,
          },
          data: {
            nombre,
            email,
            telefono,
            imagenURL,
          },
        },
      );

      return NextResponse.json(
        {
          ok: true,
          message:
            "Driver actualizado",
        },
      );
    }

    // ==================================================
    // USER DELETED
    // ==================================================

    if (
      evt.type ===
      "user.deleted"
    ) {
      await prisma.driver.deleteMany(
        {
          where: {
            clerkUserId,
          },
        },
      );

      return NextResponse.json(
        {
          ok: true,
          message:
            "Driver eliminado",
        },
      );
    }

    // ==================================================
    // EVENTOS IGNORADOS
    // ==================================================

    return NextResponse.json({
      ok: true,
      message:
        "Evento ignorado",
    });
  } catch (error: any) {
    console.error(
      "WEBHOOK ERROR:",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          error?.message,
        code:
          error?.code,
        meta:
          error?.meta,
        stack:
          process.env
            .NODE_ENV ===
          "development"
            ? error?.stack
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}