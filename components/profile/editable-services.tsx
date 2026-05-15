"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { updateDriverServices } from "@/app/cuenta/actions";

type Service = {
  id: string;
  nombre: string;
};

type Props = {
  currentServices: Service[];
  allServices: Service[];
};

export function EditableServices({
  currentServices,
  allServices,
}: Props) {
  const router =
    useRouter();

  const [open, setOpen] =
    useState(false);

  const [isPending, startTransition] =
    useTransition();

  const initialSelected =
    useMemo(
      () =>
        currentServices.map(
          (s) => s.id,
        ),
      [currentServices],
    );

  const [selected, setSelected] =
    useState<string[]>(
      initialSelected,
    );

  const visibleServices =
    allServices.filter(
      (service) =>
        selected.includes(
          service.id,
        ),
    );

  function toggleService(
    id: string,
  ) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (s) => s !== id,
          )
        : [...prev, id],
    );
  }

  function handleCancel() {
    setSelected(
      initialSelected,
    );

    setOpen(false);
  }

  function handleSave() {
    startTransition(
      async () => {
        try {
          const formData =
            new FormData();

          selected.forEach(
            (id) => {
              formData.append(
                "serviceIds",
                id,
              );
            },
          );

          await updateDriverServices(
            formData,
          );

          setOpen(false);

          router.refresh();
        } catch (error) {
          console.error(
            error,
          );
        }
      },
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.03] p-4 sm:rounded-3xl sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
              Servicios habilitados
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
              {visibleServices.length >
              0 ? (
                visibleServices.map(
                  (
                    service,
                  ) => (
                    <span
                      key={
                        service.id
                      }
                      className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-highlight sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {
                        service.nombre
                      }
                    </span>
                  ),
                )
              ) : (
                <p className="text-xs text-highlight/50 sm:text-sm">
                  No hay
                  servicios
                  habilitados
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              setOpen(true)
            }
            className="shrink-0 text-sm font-semibold text-accent transition hover:opacity-80"
          >
            Editar
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[90] transition ${
          open
            ? "pointer-events-auto"
            : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open
              ? "opacity-100"
              : "opacity-0"
          }`}
          onClick={
            handleCancel
          }
        />

        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-[1.5rem] border border-highlight/10 bg-[#210d2d] p-5 shadow-2xl transition-transform duration-300 sm:rounded-t-[2rem] sm:p-6 ${
            open
              ? "translate-y-0"
              : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-highlight/20 sm:mb-6 sm:h-1.5 sm:w-14" />

          <h3 className="text-lg font-bold text-highlight sm:text-xl">
            Editar servicios
          </h3>

          <p className="mt-0.5 text-xs text-highlight/60 sm:mt-1 sm:text-sm">
            Selecciona los
            trabajos que
            quieres recibir.
          </p>

          <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto sm:mt-6 sm:max-h-[45vh] sm:space-y-3">
            {allServices.map(
              (
                service,
              ) => {
                const active =
                  selected.includes(
                    service.id,
                  );

                return (
                  <button
                    key={
                      service.id
                    }
                    type="button"
                    onClick={() =>
                      toggleService(
                        service.id,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition sm:px-5 sm:py-4 ${
                      active
                        ? "border-accent bg-accent/10"
                        : "border-highlight/10 bg-highlight/[0.04]"
                    }`}
                  >
                    <span className="text-sm font-medium text-highlight sm:text-base">
                      {
                        service.nombre
                      }
                    </span>

                    <div
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs sm:h-7 sm:w-7 sm:text-sm ${
                        active
                          ? "border-accent bg-accent text-primary"
                          : "border-highlight/20"
                      }`}
                    >
                      {active
                        ? "✓"
                        : ""}
                    </div>
                  </button>
                );
              },
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:gap-3">
            <button
              onClick={
                handleCancel
              }
              className="w-full rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-3 text-sm font-semibold text-highlight sm:w-auto sm:py-4"
            >
              Cancelar
            </button>

            <button
              onClick={
                handleSave
              }
              disabled={
                isPending
              }
              className="w-full rounded-2xl bg-magenta px-5 py-3 text-sm font-semibold text-white sm:w-auto sm:py-4"
            >
              {isPending
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}