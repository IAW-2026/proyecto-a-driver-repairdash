"use client";

import { useTransition } from "react";
import { updateDriverAvailability } from "@/lib/actions/driver.actions";
import type { DriverAvailability } from "@/types/dashboard";

type DriverStatusCardProps = {
  status: DriverAvailability;
  offeredServices: string[];
};

const statusCopy: Record<
  DriverAvailability,
  {
    title: string;
    description: string;
  }
> = {
  ONLINE: {
    title: "ONLINE",
    description:
      "Estas visible para nuevas solicitudes compatibles con tus servicios.",
  },

  OFFLINE: {
    title: "OFFLINE",
    description:
      "No estas recibiendo nuevas solicitudes en este momento.",
  },

  EN_TRABAJO: {
    title: "EN TRABAJO",
    description:
      "Tienes un servicio activo en progreso.",
  },
};

export function DriverStatusCard({
  status,
  offeredServices,
}: DriverStatusCardProps) {
  const [isPending, startTransition] =
    useTransition();

  const isOnline =
    status === "ONLINE";

  const isDisabled =
    status ===
      "EN_TRABAJO" ||
    isPending;

  function handleToggle() {
    if (
      status ===
      "EN_TRABAJO"
    ) {
      return;
    }

    const nextStatus =
      status ===
      "ONLINE"
        ? "OFFLINE"
        : "ONLINE";

    startTransition(
      async () => {
        await updateDriverAvailability(
          nextStatus,
        );
      },
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-highlight/10 bg-highlight/[0.055] p-4 shadow-2xl shadow-black/25 sm:p-5">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[40px] bg-magenta/15 sm:h-28 sm:w-28 sm:rounded-bl-[48px]" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Estado actual
          </p>

          <h2 className="mt-2 text-3xl font-black leading-none text-highlight sm:mt-3 sm:text-4xl">
            {
              statusCopy[
                status
              ].title
            }
          </h2>

          <p className="mt-2 max-w-md text-xs leading-5 text-highlight/68 sm:mt-3 sm:text-sm sm:leading-6">
            {
              statusCopy[
                status
              ]
                .description
            }
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleToggle
          }
          disabled={
            isDisabled
          }
          aria-pressed={
            isOnline
          }
          className={`relative h-8 w-16 shrink-0 rounded-full border p-1 transition ${
            isOnline
              ? "border-magenta/60 bg-magenta/30"
              : "border-highlight/15 bg-highlight/10"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`block h-5.5 w-5.5 rounded-full bg-highlight shadow-lg transition ${
              isOnline
                ? "translate-x-8 shadow-magenta/40"
                : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2 sm:mt-5">
        {offeredServices.map(
          (
            service,
          ) => (
            <span
              key={
                service
              }
              className="max-w-full truncate rounded-full border border-accent/25 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-highlight sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {
                service
              }
            </span>
          ),
        )}
      </div>
    </article>
  );
}
