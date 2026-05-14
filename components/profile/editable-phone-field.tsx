"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { updateProfileData } from "@/app/cuenta/actions";

type EditablePhoneFieldProps = {
  value: string | null;
};

export function EditablePhoneField({
  value,
}: EditablePhoneFieldProps) {
  const router =
    useRouter();

  const [editing, setEditing] =
    useState(false);

  const [phone, setPhone] =
    useState<string | undefined>(
      value ?? undefined,
    );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  useEffect(() => {
    setPhone(
      value ?? undefined,
    );
  }, [value]);

  function cancelEdit() {
    setPhone(
      value ?? undefined,
    );

    setEditing(false);
  }

  function savePhone() {
    startTransition(
      async () => {
        try {
          const formData =
            new FormData();

          formData.append(
            "telefono",
            phone ?? "",
          );

          await updateProfileData(
            formData,
          );

          setEditing(false);

          router.refresh();
        } catch (error) {
          console.error(
            error,
          );
        }
      },
    );
  }

  async function handleKeyDown(
    event: React.KeyboardEvent,
  ) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      savePhone();
    }

    if (
      event.key === "Escape"
    ) {
      cancelEdit();
    }
  }

  return (
    <div className="rounded-3xl border border-highlight/10 bg-highlight/[0.03] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-highlight/40">
        Teléfono
      </p>

      {!editing ? (
        <button
          onClick={() =>
            setEditing(true)
          }
          className="mt-2 w-full text-left"
        >
          <p className="text-base font-medium text-highlight transition hover:text-accent">
            {value ??
              "Agregar teléfono"}
          </p>
        </button>
      ) : (
        <div className="mt-4">
          <div className="rounded-2xl border border-highlight/10 bg-primary px-4 py-3">
            <PhoneInput
              international
              defaultCountry="AR"
              value={phone}
              onChange={
                setPhone
              }
              onKeyDown={
                handleKeyDown
              }
              className="text-highlight"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={
                cancelEdit
              }
              className="flex-1 rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-3 font-semibold text-highlight"
            >
              Cancelar
            </button>

            <button
              onClick={
                savePhone
              }
              disabled={
                isPending
              }
              className="flex-1 rounded-2xl bg-magenta px-5 py-3 font-semibold text-white"
            >
              {isPending
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}