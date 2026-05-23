"use client";

import Link from "next/link";

type DriverDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverImageUrl: string | null;
  rating: number;
};

const menuItems = [
  {
    label: "Administrar cuenta",
    href: "/cuenta",
  },
  {
    label: "Ingresos",
    href: "/ingresos",
  },
  {
    label: "Trabajos",
    href: "/historial",
  },
];

export function DriverDrawer({
  isOpen,
  onClose,
  driverName,
  driverImageUrl,
  rating,
}: DriverDrawerProps) {
  const initials =
    driverName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "RD";

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
        className={`fixed left-0 top-0 z-50 flex h-full w-[82vw] max-w-sm flex-col border-r border-highlight/10 bg-[#210d2d] px-5 py-6 shadow-2xl shadow-black/40 transition-transform duration-300 ${
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

        {/* Profile card — mobile only */}
        <Link
          href="/cuenta"
          onClick={onClose}
          className="mt-auto flex items-center gap-3 rounded-2xl border border-highlight/10 bg-highlight/[0.06] p-3 transition hover:border-accent/30 hover:bg-highlight/[0.09] lg:hidden"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-highlight/10 bg-accent/12 text-sm font-black text-highlight">
            {driverImageUrl ? (
              <img
                src={driverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-highlight">
              {driverName}
            </p>

            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-highlight/65">
              <span className="text-amber-400">★</span>
              {rating.toFixed(1)}
            </p>
          </div>
        </Link>
      </aside>
    </>
  );
}