"use client";

import { useClerk } from "@clerk/nextjs";

const RIDER_APP_URL =
  "https://proyecto-a-rider-repairdash.vercel.app";

export function RiderAccountActions() {
  const { signOut } =
    useClerk();

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      <a
        href={RIDER_APP_URL}
        className="inline-flex h-14 items-center justify-center rounded-2xl bg-magenta px-6 text-sm font-black text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90"
      >
        Ir a Rider App
      </a>

      <button
        type="button"
        onClick={() =>
          signOut({
            redirectUrl:
              "/login",
          })
        }
        className="inline-flex h-14 items-center justify-center rounded-2xl border border-highlight/10 bg-highlight/[0.06] px-6 text-sm font-black text-highlight transition hover:bg-highlight/10"
      >
        Volver a log in
      </button>
    </div>
  );
}
