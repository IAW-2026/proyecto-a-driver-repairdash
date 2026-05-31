import {
  currentUser,
} from "@clerk/nextjs/server";

export type AppRole =
  | "driver"
  | "driver-admin"
  | "rider";

export function normalizeAppRole(
  role: unknown,
): AppRole | null {
  if (
    role === "driver" ||
    role === "driver-admin" ||
    role === "rider"
  ) {
    return role;
  }

  return null;
}

export function isRiderRole(
  role: unknown,
) {
  return normalizeAppRole(
    role,
  ) === "rider";
}

export async function getUserRole(): Promise<AppRole> {
  const user =
    await currentUser();

  const metadata =
    user?.publicMetadata as {
      role?: string;
    };

  const role =
    normalizeAppRole(
      metadata.role,
    );

  return role ?? "driver";
}
