import {
  currentUser,
} from "@clerk/nextjs/server";

export type AppRole =
  | "driver"
  | "driver-admin";

export async function getUserRole(): Promise<AppRole> {
  const user =
    await currentUser();

  const metadata =
    user?.publicMetadata as {
      role?: string;
    };

  return metadata.role ===
    "driver-admin"
    ? "driver-admin"
    : "driver";
}