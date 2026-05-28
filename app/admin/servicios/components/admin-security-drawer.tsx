"use client";

import { X } from "lucide-react";

import { SecurityActions } from "@/components/profile/security-actions";

type AdminSecurityDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminImageUrl?: string | null;
};

export function AdminSecurityDrawer({
  isOpen,
  onClose,
  adminName,
  adminImageUrl,
}: AdminSecurityDrawerProps) {
  const initials =
    adminName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AD";

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[86vw] max-w-md flex-col border-r border-highlight/10 bg-[#210d2d] px-5 py-6 shadow-2xl shadow-black/45 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu de seguridad admin"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-magenta">
              RepairDash Admin
            </p>
            <h2 className="mt-2 text-xl font-black text-highlight">
              Seguridad
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-highlight/10 bg-highlight/[0.06] text-highlight transition hover:bg-highlight/[0.1]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 rounded-[28px] border border-highlight/10 bg-highlight/[0.055] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-highlight/10 bg-accent/12 text-sm font-black text-highlight">
              {adminImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adminImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-highlight">
                {adminName}
              </p>
              <p className="mt-1 text-xs font-semibold text-highlight/50">
                Administrador
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <SecurityActions onActionComplete={onClose} />
        </div>
      </aside>
    </>
  );
}
