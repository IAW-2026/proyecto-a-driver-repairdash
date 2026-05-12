"use client";

import { useRef, useState, useTransition } from "react";
import { updateDriverProfile } from "@/app/profile/actions";

type Props = {
  isOpen: boolean;
  currentNombre: string;
  onClose: () => void;
};

export function EditProfileModal({ isOpen, currentNombre, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateDriverProfile(formData);
        onClose();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — bottom sheet en mobile, modal centrado en desktop */}
      <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <div className="w-full rounded-t-[32px] border border-highlight/10 bg-[#1a0b26] p-6 shadow-2xl shadow-black/40 sm:max-w-md sm:rounded-[28px]">

          {/* Handle bar visible solo en mobile */}
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-highlight/20 sm:hidden" />

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-highlight">Editar perfil</h2>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-highlight/10 bg-highlight/5 text-highlight/60 transition hover:bg-highlight/10"
            >
              ✕
            </button>
          </div>

          <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-highlight/45"
              >
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                defaultValue={currentNombre}
                minLength={2}
                required
                disabled={isPending}
                className="w-full rounded-2xl border border-highlight/10 bg-highlight/[0.04] px-4 py-3 text-sm font-semibold text-highlight placeholder-highlight/30 outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 rounded-2xl border border-highlight/10 bg-highlight/[0.04] py-3 text-sm font-semibold text-highlight/70 transition hover:bg-highlight/[0.08] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-2xl bg-[#F500F1] py-3 text-sm font-bold text-white shadow-lg shadow-[#F500F1]/20 transition hover:bg-[#d400d0] disabled:opacity-60"
              >
                {isPending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
