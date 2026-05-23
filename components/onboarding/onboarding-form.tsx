"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";
import { completeOnboarding } from "@/app/onboarding/actions";

type Service = {
  id: string;
  nombre: string;
};

type Props = {
  driverName: string;
  driverImageUrl: string | null;
  driverPhone: string | null;
  currentServiceIds: string[];
  allServices: Service[];
};

const STEPS = ["Foto", "Teléfono", "Servicios"];

export function OnboardingForm({
  driverName,
  driverImageUrl,
  driverPhone,
  currentServiceIds,
  allServices,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState(driverPhone ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(currentServiceIds);

  const initials = driverName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const imageSrc = avatarPreview ?? driverImageUrl;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function toggleService(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function handleSubmit() {
    startTransition(async () => {
      const formData = new FormData();
      if (avatarFile) formData.append("avatar", avatarFile);
      formData.append("telefono", phone);
      selectedIds.forEach((id) => formData.append("serviceIds", id));
      await completeOnboarding(formData);
      router.push("/");
      router.refresh();
    });
  }

  const canGoNext = () => {
    if (step === 0) return true;
    if (step === 1) return phone.trim().length > 0;
    if (step === 2) return selectedIds.length > 0;
    return true;
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < step
                  ? "bg-magenta text-white"
                  : i === step
                    ? "border-2 border-magenta bg-magenta/10 text-highlight"
                    : "border border-highlight/15 bg-highlight/[0.04] text-highlight/35"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 transition-colors ${
                  i < step ? "bg-magenta" : "bg-highlight/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-1 flex-col">
        {step === 0 && (
          <div className="flex flex-col items-center">
            <p className="text-center text-2xl font-bold text-highlight">
              Bienvenido, {driverName.split(" ")[0]}!
            </p>
            <p className="mt-2 text-center text-sm text-highlight/55">
              Agregá una foto para que los clientes te reconozcan.
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="group relative mt-10 h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-highlight/20 bg-highlight/[0.04] transition hover:border-accent/40"
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-4xl font-bold text-highlight/40">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-primary">
                  <Camera className="h-6 w-6" />
                </div>
              </div>
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

            {avatarPreview && (
              <p className="mt-3 text-xs text-highlight/45">Foto seleccionada</p>
            )}

            <p className="mt-6 text-center text-xs text-highlight/35">
              Podés cambiarla más tarde desde tu perfil.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-center text-2xl font-bold text-highlight">
              Tu número de contacto
            </p>
            <p className="mt-2 text-center text-sm text-highlight/55">
              Los clientes lo usarán para comunicarse con vos.
            </p>

            <div className="mt-8">
              <label className="text-xs font-semibold uppercase tracking-wider text-highlight/40">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 11 5555-5555"
                className="mt-2 w-full rounded-2xl border border-highlight/10 bg-highlight/[0.04] px-5 py-4 text-base text-highlight outline-none transition placeholder:text-highlight/25 focus:border-accent/50 focus:bg-highlight/[0.06]"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-center text-2xl font-bold text-highlight">
              Tus servicios
            </p>
            <p className="mt-2 text-center text-sm text-highlight/55">
              Seleccioná al menos un servicio que ofrezcas.
            </p>

            <div className="mt-8 space-y-2">
              {allServices.map((service) => {
                const active = selectedIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${
                      active
                        ? "border-accent bg-accent/10"
                        : "border-highlight/10 bg-highlight/[0.04] hover:border-highlight/20"
                    }`}
                  >
                    <span className="text-sm font-medium text-highlight">
                      {service.nombre}
                    </span>
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm transition ${
                        active
                          ? "border-accent bg-accent text-primary"
                          : "border-highlight/20"
                      }`}
                    >
                      {active ? <Check className="h-4 w-4" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedIds.length === 0 && (
              <p className="mt-4 text-center text-xs text-highlight/35">
                Necesitás al menos un servicio para empezar.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-10">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 rounded-2xl border border-highlight/10 bg-highlight/[0.04] px-6 py-3 text-sm font-semibold text-highlight transition hover:bg-highlight/[0.08]"
          >
            <ChevronLeft className="h-4 w-4" />
            Atrás
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext()}
            className="flex items-center gap-2 rounded-2xl bg-magenta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90 disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canGoNext()}
            className="flex items-center gap-2 rounded-2xl bg-magenta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-magenta/25 transition hover:bg-magenta/90 disabled:opacity-40"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Comenzar
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
