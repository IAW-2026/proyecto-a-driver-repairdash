"use client";

import { Loader2, Plus, X } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";

import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

import { createServiceType } from "../actions";

type CreateServiceModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (service: AdminServiceType) => void;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo crear el servicio.";
}

export function CreateServiceModal({
  open,
  onClose,
  onCreated,
}: CreateServiceModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);

    startTransition(async () => {
      try {
        const service = await createServiceType(formData);
        form.reset();
        onCreated(service);
      } catch (actionError) {
        setError(getErrorMessage(actionError));
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm">
      <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-[30px] border border-highlight/10 bg-[#1f0c2c] shadow-2xl shadow-black/45">
        <div className="relative border-b border-highlight/10 p-5 sm:p-6">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[56px] bg-magenta/10 blur-2xl" />

          <div className="relative flex items-start justify-between gap-5">
            <div>
              <div className="grid h-11 w-11 place-items-center rounded-[18px] border border-magenta/20 bg-magenta/15 text-magenta">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-highlight sm:text-3xl">
                Nuevo servicio
              </h2>
              <p className="mt-2 text-sm leading-6 text-highlight/55">
                Definí el tipo de trabajo que los conductores podrán ofrecer.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.05] text-highlight/60 transition hover:bg-highlight/[0.1] hover:text-highlight"
              disabled={isPending}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight/40">
              Nombre
            </label>
            <input
              name="nombre"
              placeholder="Ej: Plomería"
              className="mt-3 h-14 w-full rounded-[24px] border border-highlight/10 bg-primary/45 px-5 text-base font-bold text-highlight outline-none transition placeholder:text-highlight/25 focus:border-magenta/55 focus:bg-primary/65"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight/40">
              Descripción
            </label>
            <textarea
              name="descripcion"
              placeholder="Describí el alcance del servicio"
              rows={4}
              className="mt-3 w-full resize-none rounded-[24px] border border-highlight/10 bg-primary/45 px-5 py-4 text-sm font-medium leading-7 text-highlight outline-none transition placeholder:text-highlight/25 focus:border-magenta/55 focus:bg-primary/65"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight/40">
              Precio base
            </label>
            <input
              name="precioBase"
              type="number"
              min="1"
              step="0.01"
              placeholder="15000"
              className="mt-3 h-14 w-full rounded-[24px] border border-magenta/25 bg-primary/45 px-5 text-xl font-black text-highlight outline-none transition placeholder:text-highlight/25 focus:border-magenta/70 focus:bg-primary/65"
              required
            />
          </div>

          {error && (
            <p className="rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-highlight/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-[20px] border border-highlight/10 bg-highlight/[0.06] px-5 text-sm font-bold text-highlight transition hover:bg-highlight/[0.1]"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[20px] bg-magenta px-6 text-sm font-black text-white shadow-xl shadow-magenta/20 transition hover:-translate-y-0.5 hover:bg-magenta/90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Crear servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
