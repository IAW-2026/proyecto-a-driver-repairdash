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
      <div className="rounded-3xl border border-highlight/10 bg-highlight/[0.03] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-highlight/40">
              Servicios habilitados
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
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
                      className="rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-medium text-highlight"
                    >
                      {
                        service.nombre
                      }
                    </span>
                  ),
                )
              ) : (
                <p className="text-sm text-highlight/50">
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
            className="text-sm font-semibold text-accent transition hover:opacity-80"
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
          className={`absolute bottom-0 left-0 right-0 rounded-t-[2rem] border border-highlight/10 bg-[#210d2d] p-6 shadow-2xl transition-transform duration-300 ${
            open
              ? "translate-y-0"
              : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-6 h-1.5 w-14 rounded-full bg-highlight/20" />

          <h3 className="text-xl font-bold text-highlight">
            Editar servicios
          </h3>

          <p className="mt-1 text-sm text-highlight/60">
            Selecciona los
            trabajos que
            quieres recibir.
          </p>

          <div className="mt-6 max-h-[45vh] space-y-3 overflow-y-auto">
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
                    className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 transition ${
                      active
                        ? "border-accent bg-accent/10"
                        : "border-highlight/10 bg-highlight/[0.04]"
                    }`}
                  >
                    <span className="font-medium text-highlight">
                      {
                        service.nombre
                      }
                    </span>

                    <div
                      className={`grid h-7 w-7 place-items-center rounded-full border text-sm ${
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

          <div className="mt-6 flex gap-3">
            <button
              onClick={
                handleCancel
              }
              className="flex-1 rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-4 font-semibold text-highlight"
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
              className="flex-1 rounded-2xl bg-magenta px-5 py-4 font-semibold text-white"
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