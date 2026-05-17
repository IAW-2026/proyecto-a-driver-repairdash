import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  UserRole,
  DriverStatus,
} from "@prisma/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET =
    process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Falta CLERK_WEBHOOK_SECRET",
    );
  }

  const headerPayload =
    await headers();

  const svixId =
    headerPayload.get("svix-id");

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
    return new Response(
      "Headers faltantes",
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
  } catch (err) {
    console.error(
      "Webhook inválido",
      err,
    );

    return new Response(
      "Error verificando webhook",
      {
        status: 400,
      },
    );
  }

  // USER CREATED
  if (evt.type === "user.created") {
  const user = evt.data;

  const clerkUserId = user.id;

  const email =
    user.email_addresses?.[0]
      ?.email_address ?? "";

  const firstName =
    user.first_name ??
    "Driver";

  try {
<<<<<<< Updated upstream
    // Crear driver (idempotente)
=======
    console.log(
        "Creando driver..."
    );

>>>>>>> Stashed changes
    await prisma.driver.upsert({
      where: {
        clerkUserId,
      },
      update: {},
      create: {
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

<<<<<<< Updated upstream
    // Clerk client
=======
    console.log(
        "Driver OK"
    );

>>>>>>> Stashed changes
    const clerk =
      await clerkClient();

<<<<<<< Updated upstream
    // Merge metadata existente
    const currentUser =
      await clerk.users.getUser(
=======
    console.log(
        "Clerk client OK"
    );

    const response =
        await clerk.users.updateUserMetadata(
>>>>>>> Stashed changes
        clerkUserId,
      );

<<<<<<< Updated upstream
    await clerk.users.updateUserMetadata(
      clerkUserId,
      {
        publicMetadata: {
          ...currentUser.publicMetadata,
          role:
            "driver",
        },
      },
=======
    console.log(
        "Metadata OK:",
        response.publicMetadata,
>>>>>>> Stashed changes
    );
  } catch (error) {
    console.error(
      error,
    );
<<<<<<< Updated upstream

    return NextResponse.json(
      {
        error:
          "Error creando driver",
      },
      {
        status: 500,
      },
    );
  }
=======
    }
>>>>>>> Stashed changes
}

  return NextResponse.json(
    {
      success: true,
    },
  );
}