"use client";

import { useClerk } from "@clerk/nextjs";

export function RoleErrorActions() {
  const { signOut } =
    useClerk();

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={() =>
          signOut({
            redirectUrl:
              "/login",
          })
        }
        className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-magenta px-6 text-sm font-black text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90 sm:w-auto"
      >
        Volver a log in
      </button>
    </div>
  );
}
