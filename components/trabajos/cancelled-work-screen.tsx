"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCancelledWorkNoticeKey } from "@/lib/utils/cancelled-work-notice";

type CancelledWorkScreenProps = {
  trabajoId: string;
  actualizadoEn: Date;
  tipoServicioNombre: string;
};

export function CancelledWorkScreen({
  trabajoId,
  actualizadoEn,
  tipoServicioNombre,
}: CancelledWorkScreenProps) {
  const router = useRouter();
  const [
    shouldRender,
    setShouldRender,
  ] = useState(false);

  useEffect(() => {
    const storageKey =
      getCancelledWorkNoticeKey(
        trabajoId,
        actualizadoEn,
      );

    if (
      window.localStorage.getItem(
        storageKey,
      ) === "seen"
    ) {
      router.replace("/");
      return;
    }

    window.localStorage.setItem(
      storageKey,
      "seen",
    );

    const timeoutId =
      window.setTimeout(
        () => setShouldRender(true),
        0,
      );

    return () =>
      window.clearTimeout(
        timeoutId,
      );
  }, [
    actualizadoEn,
    router,
    trabajoId,
  ]);

  if (!shouldRender) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#271033] via-[#271033] to-[#160822] px-6 text-center text-highlight">
      <div className="w-full max-w-md rounded-[32px] border border-highlight/10 bg-highlight/[0.05] p-7 shadow-2xl shadow-black/25">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Trabajo cancelado
        </p>
        <h1 className="mt-4 text-3xl font-black leading-tight text-highlight">
          Ups... el rider cancelo el trabajo
        </h1>
        <p className="mt-3 text-sm leading-6 text-highlight/60">
          {tipoServicioNombre} ya no esta disponible. Te dejamos nuevamente
          online para recibir nuevas solicitudes.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-magenta px-6 text-sm font-black text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
