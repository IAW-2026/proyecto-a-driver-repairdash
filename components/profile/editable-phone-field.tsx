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
    <div className="rounded-2xl border border-highlight/10 bg-highlight/[0.03] p-4 sm:rounded-3xl sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-highlight/40 sm:text-xs">
        Teléfono
      </p>

      {!editing ? (
        <button
          onClick={() =>
            setEditing(true)
          }
          className="mt-1.5 w-full text-left sm:mt-2"
        >
          <p className="text-sm font-medium text-highlight transition hover:text-accent sm:text-base">
            {value ??
              "Agregar teléfono"}
          </p>
        </button>
      ) : (
        <div className="mt-3 sm:mt-4">
          <div className="rounded-2xl border border-highlight/10 bg-primary px-3 py-2.5 sm:px-4 sm:py-3">
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
              className="text-sm text-highlight sm:text-base"
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:gap-3">
            <button
              onClick={
                cancelEdit
              }
              className="w-full rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-3 text-sm font-semibold text-highlight sm:w-auto"
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
              className="w-full rounded-2xl bg-magenta px-5 py-3 text-sm font-semibold text-white sm:w-auto"
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