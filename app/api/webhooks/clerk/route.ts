import { Webhook } from "svix";
import { headers } from "next/headers";
import { createClerkClient } from "@clerk/backend";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  UserRole,
  DriverStatus,
} from "@prisma/client";

export async function POST(
  req: Request,
) {
  const WEBHOOK_SECRET =
    process.env
      .CLERK_WEBHOOK_SECRET;

  if (
    !WEBHOOK_SECRET
  ) {
    return NextResponse.json(
      { ok: false },
      { status: 500 },
    );
  }

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

  const payload =
    await req.text();

  const wh =
    new Webhook(
      WEBHOOK_SECRET,
    );

  let evt: {
    type: string;
    data: any;
  };

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
    ) as {
      type: string;
      data: any;
    };
  } catch (err: any) {
    return NextResponse.json(
      { ok: false },
      { status: 400 },
    );
  }

  if (
    evt.type !==
    "user.created"
  ) {
    return NextResponse.json(
      { ok: true },
    );
  }

  const user =
    evt.data;

  const clerkUserId =
    user.id;

  const email =
    user.email_addresses?.[0]
      ?.email_address ??
    "";

  const firstName =
    user.first_name ??
    "Driver";

  try {
    await prisma.driver.create({
      data: {
        clerkUserId,
        email,
        nombre:
          firstName ??
          "Usuario",
        role:
          UserRole.DRIVER,
        status:
          DriverStatus.OFFLINE,
      },
    });

    const c =
      createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    await c.users.updateUser(
      clerkUserId,
      {
        publicMetadata:
          {
            role:
              "driver",
          },
      },
    );

    return NextResponse.json(
      { ok: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("WEBHOOK ERROR:", error);

    return NextResponse.json(
        {
        ok: false,
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack:
            process.env.NODE_ENV ===
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
