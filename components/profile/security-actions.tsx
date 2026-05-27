"use client";

import { useClerk } from "@clerk/nextjs";
import { ChevronRight, KeyRound, LogOut, Mail } from "lucide-react";

type SecurityActionsProps = {
  onActionComplete?: () => void;
};

const actions = [
  {
    title: "Cambiar contrasena",
    description: "Actualiza tu contrasena de acceso.",
    icon: KeyRound,
    type: "profile" as const,
  },
  {
    title: "Gestionar email",
    description: "Modificar tu direccion de correo.",
    icon: Mail,
    type: "profile" as const,
  },
  {
    title: "Cerrar sesion",
    description: "Salir de tu cuenta en este dispositivo.",
    icon: LogOut,
    type: "sign-out" as const,
    destructive: true,
  },
];

export function SecurityActions({ onActionComplete }: SecurityActionsProps) {
  const { openUserProfile, signOut } = useClerk();

  async function handleAction(type: "profile" | "sign-out") {
    if (type === "profile") {
      openUserProfile();
      onActionComplete?.();
      return;
    }

    await signOut({
      redirectUrl: "/",
    });
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.title}
            type="button"
            onClick={() => handleAction(action.type)}
            className={`group flex w-full items-center justify-between gap-4 rounded-[28px] border p-5 text-left transition ${
              action.destructive
                ? "border-red-500/20 bg-red-500/[0.04] hover:border-red-500/30 hover:bg-red-500/[0.06]"
                : "border-highlight/10 bg-highlight/[0.03] hover:border-highlight/20 hover:bg-highlight/[0.06]"
            }`}
          >
            <div className="flex min-w-0 items-start gap-4">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${
                  action.destructive
                    ? "border-red-500/20 bg-red-500/10 text-red-400"
                    : "border-highlight/10 bg-highlight/[0.06] text-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3
                  className={`font-semibold ${
                    action.destructive ? "text-red-400" : "text-highlight"
                  }`}
                >
                  {action.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-highlight/55">
                  {action.description}
                </p>
              </div>
            </div>

            <ChevronRight
              className={`h-5 w-5 shrink-0 transition group-hover:translate-x-1 ${
                action.destructive ? "text-red-400/70" : "text-highlight/40"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
