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
      {
        ok: false,
        step:
          "missing_secret",
        error:
          "Falta CLERK_WEBHOOK_SECRET",
      },
      {
        status: 500,
      },
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
      {
        ok: false,
        step:
          "missing_headers",
        error:
          "Headers faltantes",
      },
      {
        status: 400,
      },
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
      {
        ok: false,
        step:
          "verify_webhook",
        error:
          err?.message,
      },
      {
        status: 400,
      },
    );
  }

  if (
    evt.type !==
    "user.created"
  ) {
    return NextResponse.json(
      {
        ok: true,
        step:
          "ignored_event",
        type:
          evt.type,
      },
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
    // STEP 1
    await prisma.driver.create(
      {
        data: {
          clerkUserId,
          email,
          nombre:
            firstName,
          role:
            UserRole.DRIVER,
          status:
            DriverStatus.OFFLINE,
        },
      },
    );

    // STEP 2
    const c =
      await clerkClient();

    // STEP 3
    const updatedUser =
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
      {
        ok: true,
        step:
          "metadata_updated",
        publicMetadata:
          updatedUser.publicMetadata,
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        step:
          "create_driver_or_update_metadata",
        error:
          error?.message ??
          "Unknown error",
        name:
          error?.name,
        cause:
          error?.cause ??
          null,
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