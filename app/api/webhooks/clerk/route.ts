import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
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
      await clerkClient();

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
    return NextResponse.json(
      { ok: false },
      { status: 500 },
    );
  }
}
