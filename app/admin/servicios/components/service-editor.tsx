"use client";

import {
  AlertTriangle,
  ClipboardList,
  Loader2,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useState, useTransition } from "react";

import type { AdminServiceType } from "@/lib/services/admin/service-tipos-de-servicios";

import { deleteServiceType, updateServiceType } from "../actions";

type ServiceEditorProps = {
  service?: AdminServiceType;
  onDelete: (serviceId: string) => void;
  onUpdate: (service: AdminServiceType) => void;
  onStatusChange: (message: string) => void;
};

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  currency: "ARS",
  maximumFractionDigits: 0,
  style: "currency",
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la operación.";
}

export function ServiceEditor({
  service,
  onDelete,
  onUpdate,
  onStatusChange,
}: ServiceEditorProps) {
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service) {
    return (
      <section className="grid min-h-[460px] place-items-center rounded-[32px] border border-dashed border-highlight/15 bg-highlight/[0.03] p-8 text-center shadow-2xl shadow-black/15 backdrop-blur-xl">
        <div className="max-w-md">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[24px] border border-highlight/10 bg-highlight/[0.06] text-highlight/55">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-2xl font-black text-highlight">
            Todavía no hay servicios
          </h2>
          <p className="mt-3 text-sm leading-6 text-highlight/55">
            Creá el primer tipo de trabajo para habilitar la administración de
            precios, conductores y operaciones.
          </p>
        </div>
      </section>
    );
  }

  const assignedDrivers = new Set(
    service.trabajos
      .map((trabajo) => trabajo.driverId)
      .filter((driverId): driverId is string => Boolean(driverId)),
  ).size;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!service) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setError(null);

    startSaving(async () => {
      try {
        const updatedService = await updateServiceType(service.id, formData);
        onUpdate(updatedService);
        onStatusChange("Cambios guardados correctamente.");
      } catch (actionError) {
        setError(getErrorMessage(actionError));
      }
    });
  }

  function handleDelete() {
    if (!service) {
      return;
    }

    setError(null);

    startDeleting(async () => {
      try {
        await deleteServiceType(service.id);
        setShowDeleteModal(false);
        onDelete(service.id);
        onStatusChange("Servicio eliminado.");
      } catch (actionError) {
        setShowDeleteModal(false);
        setError(getErrorMessage(actionError));
      }
    });
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-highlight/10 bg-highlight/[0.04] p-5 shadow-2xl shadow-black/15 backdrop-blur-xl sm:p-7">
      <div className="absolute right-0 top-0 h-48 w-48 rounded-bl-[72px] bg-magenta/[0.08] blur-2xl" />

      <div className="relative flex flex-col gap-5 border-b border-highlight/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-highlight/40">
            Editor de servicio
          </p>
          <h2 className="mt-3 break-words text-3xl font-black leading-tight text-highlight sm:text-4xl">
            {service.nombre}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-highlight/58">
            {service.descripcion}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-72">
          <div className="rounded-[24px] border border-highlight/10 bg-primary/35 p-4">
            <Users className="h-4 w-4 text-magenta" />
            <p className="mt-3 text-2xl font-black text-highlight">
              {assignedDrivers}
            </p>
            <p className="mt-1 text-xs font-semibold text-highlight/45">
              Drivers asignados
            </p>
          </div>
          <div className="rounded-[24px] border border-highlight/10 bg-primary/35 p-4">
            <ClipboardList className="h-4 w-4 text-magenta" />
            <p className="mt-3 text-2xl font-black text-highlight">
              {service.trabajos.length}
            </p>
            <p className="mt-1 text-xs font-semibold text-highlight/45">
              Trabajos activos
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-7 space-y-5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight/40">
            Nombre
          </label>
          <input
            name="nombre"
            defaultValue={service.nombre}
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
            defaultValue={service.descripcion}
            rows={6}
            className="mt-3 w-full resize-none rounded-[24px] border border-highlight/10 bg-primary/45 px-5 py-4 text-sm font-medium leading-7 text-highlight outline-none transition placeholder:text-highlight/25 focus:border-magenta/55 focus:bg-primary/65"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-highlight/40">
            Precio base
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <input
              name="precioBase"
              type="number"
              min="1"
              step="0.01"
              defaultValue={service.precioBase}
              className="h-16 w-full rounded-[24px] border border-magenta/25 bg-primary/45 px-5 text-2xl font-black text-highlight outline-none transition placeholder:text-highlight/25 focus:border-magenta/70 focus:bg-primary/65"
              required
            />
            <div className="rounded-[22px] border border-highlight/10 bg-highlight/[0.04] px-5 py-4 text-sm font-bold text-highlight/65">
              Actual: {moneyFormatter.format(service.precioBase)}
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-[20px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-highlight/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] border border-red-400/25 bg-red-500/[0.06] px-5 text-sm font-bold text-red-200 transition hover:border-red-300/45 hover:bg-red-500/12 disabled:opacity-50"
            disabled={isSaving || isDeleting}
          >
            <Trash2 className="h-4 w-4" />
            Eliminar servicio
          </button>

          <button
            type="submit"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[22px] bg-magenta px-7 text-sm font-black text-white shadow-xl shadow-magenta/20 transition hover:-translate-y-0.5 hover:bg-magenta/90 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={isSaving || isDeleting}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar cambios
          </button>
        </div>
      </form>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-highlight/10 bg-[#1f0c2c] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-[20px] border border-red-300/20 bg-red-500/10 text-red-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-highlight/10 bg-highlight/[0.05] text-highlight/60 transition hover:bg-highlight/[0.1] hover:text-highlight"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-6 text-2xl font-black text-highlight">
              Eliminar {service.nombre}
            </h3>
            <p className="mt-3 text-sm leading-6 text-highlight/58">
              Esta acción quitará el tipo de servicio del panel administrativo.
              Si tiene trabajos o conductores asociados, la base de datos puede
              impedir la eliminación para proteger el historial.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="h-12 rounded-[20px] border border-highlight/10 bg-highlight/[0.06] px-5 text-sm font-bold text-highlight transition hover:bg-highlight/[0.1]"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[20px] bg-red-500 px-5 text-sm font-black text-white shadow-xl shadow-red-500/15 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isDeleting}
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Eliminar servicio
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
