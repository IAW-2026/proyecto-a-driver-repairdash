"use client";

import {
  useState,
  useTransition,
} from "react";
import {
  comenzarReporte,
} from "@/lib/actions/trabajo.actions";

type ReportWorkButtonProps = {
  trabajoId: string;
};

export function ReportWorkButton({
  trabajoId,
}: ReportWorkButtonProps) {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);
  const [
    isPending,
    startTransition,
  ] = useTransition();

  function confirmReport() {
    startTransition(() => {
      void comenzarReporte(
        trabajoId,
      );
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() =>
          setIsOpen(true)
        }
        className="h-16 w-full rounded-2xl bg-gradient-to-r from-[#F500F1] to-[#C392DD] text-lg font-black text-white shadow-lg shadow-[#F500F1]/25 transition hover:opacity-90"
      >
        Comenzar reporte
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#09020d]/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[32px] border border-highlight/10 bg-[#2b1038]/95 p-6 text-center shadow-2xl shadow-magenta/20">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Confirmar reporte
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-highlight">
              El trabajo quedara cancelado
            </h2>

            <p className="mt-3 text-sm leading-6 text-highlight/65">
              Al iniciar el reporte se cancelara el trabajo 
              y el caso quedara en revision. Si el reporte es aprobado, se te asignara una compensacion.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  setIsOpen(false)
                }
                className="h-14 rounded-2xl border border-highlight/10 bg-highlight/[0.06] text-sm font-black text-highlight transition hover:bg-highlight/10 disabled:opacity-50"
              >
                Volver
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={confirmReport}
                className="h-14 rounded-2xl bg-magenta px-5 text-sm font-black text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90 disabled:opacity-50"
              >
                {isPending
                  ? "Reportando..."
                  : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
