import { redirect } from "next/navigation";

import {
  getCurrentDriverProfile,
  getAllServiceTypes,
} from "@/lib/services/driver.service";

import {
  OnboardingForm,
} from "@/components/onboarding/onboarding-form";

import {
  getUserRole,
} from "@/lib/auth/get-user-role";

export const dynamic =
  "force-dynamic";

export default async function OnboardingPage() {
  const role =
    await getUserRole();

  // ADMIN nunca hace onboarding
  if (
    role ===
      "rider"
  ) {
    redirect(
      "/cuenta-rider",
    );
  }

  if (
    role ===
    "driver-admin"
  ) {
    redirect(
      "/admin/servicios",
    );
  }

  const driver =
    await getCurrentDriverProfile();

  if (
    driver.onboardingCompleto
  ) {
    redirect("/");
  }

  const allServices =
    (
      await getAllServiceTypes()
    ).map((s) => ({
      id: s.id,
      nombre: s.nombre,
    }));

  return (
    <main className="flex min-h-screen flex-col bg-primary">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
        <OnboardingForm
          driverName={
            driver.nombre
          }
          driverImageUrl={
            driver.imagenURL
          }
          driverPhone={
            driver.telefono
          }
          currentServiceIds={driver.servicios.map(
            (s) => s.id,
          )}
          allServices={
            allServices
          }
        />
      </div>
    </main>
  );
}
