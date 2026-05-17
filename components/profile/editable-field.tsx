"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateProfileData } from "@/app/cuenta/actions";

type EditableFieldProps = {
  label: string;
  field: "nombre" | "telefono" | "bio";
  value: string | null;
  multiline?: boolean;
};

export function EditableField({
  label,
  field,
  value,
  multiline = false,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);

  const [draft, setDraft] = useState(value ?? "");

  const [savedValue, setSavedValue] = useState(value ?? "");

  const [isPending, startTransition] =
    useTransition();

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedValue(value ?? "");
    setDraft(value ?? "");
  }, [value]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        handleCancel();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  function handleCancel() {
    setDraft(savedValue);
    setEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      const formData =
        new FormData();

      formData.set(
        field,
        draft,
      );

      await updateProfileData(
        formData,
      );

      setSavedValue(draft);
      setEditing(false);
    });
  }

  function handleKeyDown(
    e:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      e.key === "Enter" &&
      !multiline
    ) {
      e.preventDefault();
      handleSave();
    }

    if (e.key === "Escape") {
      handleCancel();
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="rounded-2xl border border-highlight/10 bg-highlight/[0.03] p-4 transition hover:border-highlight/20 sm:rounded-3xl sm:p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
        {label}
      </p>

      {!editing ? (
        <button
          onClick={() =>
            setEditing(true)
          }
          className="mt-1.5 w-full text-left sm:mt-2"
        >
          <p className="text-sm font-medium text-highlight sm:text-base">
            {savedValue ||
              "No configurado"}
          </p>
        </button>
      ) : (
        <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
          {multiline ? (
            <textarea
              value={draft}
              onChange={(e) =>
                setDraft(
                  e.target.value,
                )
              }
              onKeyDown={
                handleKeyDown
              }
              className="min-h-[100px] w-full rounded-2xl border border-highlight/10 bg-primary p-3 text-sm text-highlight outline-none sm:min-h-[120px] sm:p-4 sm:text-base"
              autoFocus
            />
          ) : (
            <input
              value={draft}
              onChange={(e) =>
                setDraft(
                  e.target.value,
                )
              }
              onKeyDown={
                handleKeyDown
              }
              className="w-full rounded-2xl border border-highlight/10 bg-primary p-3 text-sm text-highlight outline-none sm:p-4 sm:text-base"
              autoFocus
            />
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              onClick={
                handleSave
              }
              disabled={
                isPending
              }
              className="w-full rounded-2xl bg-magenta px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
            >
              {isPending
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

            <button
              onClick={
                handleCancel
              }
              className="w-full rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-3 text-sm font-semibold text-highlight transition hover:bg-highlight/[0.08] sm:w-auto"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}