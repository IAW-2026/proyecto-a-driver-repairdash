import {
  NextResponse,
} from "next/server";

export type ControlPlaneActor = {
  actorClerkId: string;
  actorEmail: string;
  reason: string;
};

export function parseMutationActor(
  body: Record<string, unknown>,
):
  | {
      ok: true;
      actor: ControlPlaneActor;
    }
  | {
      ok: false;
      response: NextResponse;
    } {
  const actorClerkId =
    typeof body.actorClerkId ===
    "string"
      ? body.actorClerkId.trim()
      : "";

  const actorEmail =
    typeof body.actorEmail ===
    "string"
      ? body.actorEmail.trim()
      : "";

  const reason =
    typeof body.reason ===
    "string"
      ? body.reason.trim()
      : "";

  if (
    !actorClerkId ||
    !actorEmail ||
    !reason
  ) {
    return {
      ok: false,
      response:
        NextResponse.json(
          {
            status: "error",
            message:
              "actorClerkId, actorEmail y reason son obligatorios",
          },
          {
            status: 400,
          },
        ),
    };
  }

  return {
    ok: true,
    actor: {
      actorClerkId,
      actorEmail,
      reason,
    },
  };
}

export function readBodyObject(
  body: unknown,
): Record<string, unknown> | null {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return null;
  }

  return body as Record<
    string,
    unknown
  >;
}

