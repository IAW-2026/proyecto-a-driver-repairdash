"use client";

import Image from "next/image";
import {
  Camera,
  Loader2,
} from "lucide-react";
import {
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { updateProfilePhoto } from "@/app/cuenta/actions";

type EditableAvatarProps = {
  imageUrl?: string | null;
  name: string;
};

export function EditableAvatar({
  imageUrl,
  name,
}: EditableAvatarProps) {
  const router =
    useRouter();

  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const [preview, setPreview] =
    useState<
      string | null
    >(null);

  const [file, setFile] =
    useState<File | null>(
      null,
    );

  const [
    isPending,
    startTransition,
  ] = useTransition();

  function openPicker() {
    inputRef.current?.click();
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      event.target.files?.[0];

    if (!selected)
      return;

    setFile(selected);

    const objectUrl =
      URL.createObjectURL(
        selected,
      );

    setPreview(
      objectUrl,
    );
  }

  function cancelChange() {
    setPreview(null);
    setFile(null);
  }

  function savePhoto() {
    if (!file) return;

    startTransition(
      async () => {
        try {
          const formData =
            new FormData();

          formData.append(
            "avatar",
            file,
          );

          await updateProfilePhoto(
            formData,
          );

          setPreview(null);
          setFile(null);

          setTimeout(() => {
            router.refresh();
          }, 250);
        } catch (error) {
          console.error(
            error,
          );
        }
      },
    );
  }

  const imageSrc =
    preview ??
    imageUrl ??
    null;

  return (
    <div className="flex flex-col items-center">
      <div className="group relative">
        <button
          onClick={
            openPicker
          }
          className="relative h-28 w-28 overflow-hidden rounded-full border border-accent/20 bg-accent/10"
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              unoptimized
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl font-bold text-highlight">
              {name
                .charAt(
                  0,
                )
                .toUpperCase()}
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-accent text-primary">
              <Camera className="h-5 w-5" />
            </div>
          </div>
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={
            handleChange
          }
        />
      </div>

      {preview && (
        <div className="mt-4 flex gap-3">
          <button
            onClick={
              cancelChange
            }
            className="rounded-2xl border border-highlight/10 bg-highlight/[0.05] px-5 py-3 font-semibold text-highlight"
          >
            Cancelar
          </button>

          <button
            onClick={
              savePhoto
            }
            disabled={
              isPending
            }
            className="flex items-center gap-2 rounded-2xl bg-magenta px-5 py-3 font-semibold text-white"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {isPending
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}