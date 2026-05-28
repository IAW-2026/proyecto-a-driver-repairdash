import { prisma } from "@/lib/prisma";
import { checkDriverOnboarding } from "./driver-onboarding.service";

export async function syncDriverOnboarding(
  driverId: string,
) {
  const result =
    await checkDriverOnboarding(
      driverId,
    );

  await prisma.driver.update(
    {
      where: {
        id: driverId,
      },
      data: {
        onboardingCompleto:
          result.completed,
      },
    },
  );

  return result;
}