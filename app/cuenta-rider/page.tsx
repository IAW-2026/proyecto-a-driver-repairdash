import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Wrench,
} from "lucide-react";
import {
  isRiderRole,
} from "@/lib/auth/get-user-role";
import {
  RiderAccountActions,
} from "./rider-account-actions";

export default async function RiderAccountPage() {
  const user =
    await currentUser();

  if (!user) {
    redirect(
      "/login",
    );
  }

  if (
    !isRiderRole(
      user.publicMetadata?.role,
    )
  ) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-primary px-5 py-10 text-highlight">
      <section className="w-full max-w-xl rounded-[32px] border border-highlight/10 bg-highlight/[0.05] p-7 text-center shadow-2xl shadow-black/25 sm:p-9">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-magenta/30 bg-magenta/15 text-magenta shadow-lg shadow-magenta/20">
          <Wrench
            aria-hidden
            className="h-8 w-8"
          />
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-accent">
          Cuenta no habilitada
        </p>

        <h1 className="mt-4 text-3xl font-black leading-tight text-highlight sm:text-4xl">
          Esta cuenta pertenece a Rider App
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-highlight/65 sm:text-base">
          Iniciaste sesion con una cuenta existente perteneciente a un rider.
          Para usar RepairDash Driver necesitarias ingresar con una cuenta de
          trabajador.
        </p>

        <RiderAccountActions />
      </section>
    </main>
  );
}
