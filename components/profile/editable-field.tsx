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
      className="rounded-3xl border border-highlight/10 bg-highlight/[0.03] p-5 transition hover:border-highlight/20"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-highlight/40">
        {label}
      </p>

      {!editing ? (
        <button
          onClick={() =>
            setEditing(true)
          }
          className="mt-2 w-full text-left"
        >
          <p className="font-medium text-highlight">
            {savedValue ||
              "No configurado"}
          </p>
        </button>
      ) : (
        <div className="mt-4 space-y-4">
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
              className="min-h-[120px] w-full rounded-2xl border border-highlight/10 bg-primary p-4 text-highlight outline-none"
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
              className="w-full rounded-2xl border border-highlight/10 bg-primary p-4 text-highlight outline-none"
              autoFocus
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={
                handleSave
              }
              disabled={
                isPending
              }
              className="rounded-2xl bg-magenta px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {isPending
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

            <button
              onClick={
                handleCancel
              }
              className="rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-3 font-semibold text-highlight transition hover:bg-highlight/[0.08]"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}