"use client";

import Link from "next/link";

type DriverDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const menuItems = [
  {
    label: "Perfil",
    href: "/profile",
  },
  {
    label: "Ingresos",
    href: "/ingresos",
  },
  {
    label: "Trabajos",
    href: "/trabajos",
  },
];

export function DriverDrawer({
  isOpen,
  onClose,
}: DriverDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[82vw] max-w-sm border-r border-highlight/10 bg-[#210d2d] px-5 py-6 shadow-2xl shadow-black/40 transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-label="Menu principal"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              RepairDash
            </p>

            <h2 className="mt-2 text-xl font-bold text-highlight">
              Driver App
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-highlight/10 bg-highlight/[0.06] text-lg text-highlight transition hover:bg-highlight/[0.1]"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className="flex h-14 w-full items-center justify-between rounded-2xl border border-highlight/10 bg-highlight/[0.045] px-4 text-left text-sm font-semibold text-highlight transition hover:border-accent/30 hover:bg-highlight/[0.08]"
            >
              <span>{item.label}</span>

              <span className="text-accent">
                ›
              </span>
            </Link>
          ))}
        </nav>

        {/* Bottom card */}
        <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-magenta/20 bg-magenta/10 p-4">
          <p className="text-sm font-semibold text-highlight">
            Ingresos
          </p>

          <p className="mt-1 text-xs leading-5 text-highlight/65">
            Esta opción conectará con
            Payment App cuando el
            servicio externo esté
            disponible.
          </p>
        </div>
      </aside>
    </>
  );
}