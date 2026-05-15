"use client";

type AccountSidebarProps = {
  activeSection: "resumen" | "informacion" | "seguridad";
  onChange: (
    section:
      | "resumen"
      | "informacion"
      | "seguridad",
  ) => void;
};

const items = [
  {
    id: "resumen",
    label: "Resumen",
  },
  {
    id: "informacion",
    label: "Información personal",
  },
  {
    id: "seguridad",
    label: "Seguridad",
  },
] as const;

export function AccountSidebar({
  activeSection,
  onChange,
}: AccountSidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[280px] shrink-0 lg:block">
        <div className="rounded-[28px] border border-highlight/10 bg-highlight/[0.04] p-3 shadow-2xl shadow-black/20">
          <h2 className="px-4 py-3 text-lg font-bold text-highlight">
            Cuenta RepairDash
          </h2>

          <nav className="mt-2 space-y-1">
            {items.map((item) => {
              const isActive =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  disabled={isActive}
                  onClick={() => onChange(item.id)}
                  className={`flex w-full items-center rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                    isActive
                      ? "cursor-default bg-highlight text-primary shadow-lg"
                      : "text-highlight/70 hover:bg-highlight/[0.06] hover:text-highlight"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-highlight/[0.06] p-1 pb-1 lg:hidden">
        {items.map((item) => {
          const isActive =
            activeSection === item.id;

          return (
            <button
              key={item.id}
              disabled={isActive}
              onClick={() => onChange(item.id)}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                isActive
                  ? "cursor-default bg-primary text-highlight shadow-sm"
                  : "text-highlight/60 hover:text-highlight/80"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </>
  );
}