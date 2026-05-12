"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  updateProfileData,
  updateProfilePhoto,
  updateDriverServices,
} from "@/app/profile/actions";
import type { DriverDashboardProfile, ServiceTypeDto } from "@/types/dashboard";

type Props = {
  driver: DriverDashboardProfile;
  allServices: ServiceTypeDto[];
  onClose: () => void;
};

type Section = "info" | "servicios" | "foto";

export function EditProfilePanel({ driver, allServices, onClose }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("info");

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#160822] sm:flex-row">
      {/* ── Sidebar nav (desktop) / Tab bar (mobile) ── */}
      <nav className="flex shrink-0 flex-row border-b border-highlight/8 bg-[#1a0b26] sm:w-64 sm:flex-col sm:border-b-0 sm:border-r">
        {/* Header — solo desktop */}
        <div className="hidden items-center gap-3 border-b border-highlight/8 px-6 py-5 sm:flex">
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-highlight/10 bg-highlight/5 text-highlight/50 transition hover:bg-highlight/10"
            aria-label="Cerrar"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-highlight/70">
            Editar perfil
          </span>
        </div>

        {/* Nav items */}
        {(
          [
            { key: "info", label: "Información personal", icon: "👤" },
            { key: "servicios", label: "Mis servicios", icon: "🔧" },
            { key: "foto", label: "Foto de perfil", icon: "📷" },
          ] as { key: Section; label: string; icon: string }[]
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveSection(item.key)}
            className={`flex flex-1 flex-col items-center gap-1 px-2 py-3 text-xs font-semibold transition sm:flex-row sm:flex-none sm:gap-3 sm:px-6 sm:py-4 sm:text-sm ${
              activeSection === item.key
                ? "border-b-2 border-[#F500F1] text-highlight sm:border-b-0 sm:border-l-2 sm:bg-highlight/[0.04]"
                : "text-highlight/40 hover:bg-highlight/[0.03] hover:text-highlight/70"
            }`}
          >
            <span className="text-base sm:text-lg">{item.icon}</span>
            <span className="hidden sm:block">{item.label}</span>
            <span className="sm:hidden">{item.label.split(" ")[0]}</span>
          </button>
        ))}

        {/* Cerrar — solo mobile */}
        <button
          onClick={onClose}
          className="ml-auto flex items-center px-4 text-highlight/40 sm:hidden"
        >
          ✕
        </button>
      </nav>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-10 sm:py-10">
        <div className="mx-auto max-w-lg">
          {activeSection === "info" && (
            <InfoSection driver={driver} onClose={onClose} />
          )}
          {activeSection === "servicios" && (
            <ServicesSection
              driverServicios={driver.servicios}
              allServices={allServices}
              onClose={onClose}
            />
          )}
          {activeSection === "foto" && (
            <PhotoSection driver={driver} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sección: Información personal ──────────────────────────────────────────

function InfoSection({
  driver,
  onClose,
}: {
  driver: DriverDashboardProfile;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateProfileData(formData);
        setSuccess(true);
        setTimeout(onClose, 800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <div>
      <SectionHeader
        title="Información personal"
        subtitle="Estos datos son visibles para tus clientes"
      />

      <form action={handleSubmit} className="mt-8 space-y-5">
        <Field
          label="Nombre completo"
          name="nombre"
          type="text"
          defaultValue={driver.nombre}
          placeholder="Tu nombre"
          required
          minLength={2}
          disabled={isPending}
        />

        <Field
          label="Teléfono"
          name="telefono"
          type="tel"
          defaultValue={driver.telefono ?? ""}
          placeholder="+54 9 11 0000-0000"
          disabled={isPending}
        />

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-highlight/45">
            Bio
          </label>
          <textarea
            name="bio"
            defaultValue={driver.bio ?? ""}
            placeholder="Contale a tus clientes sobre vos..."
            rows={4}
            disabled={isPending}
            className="w-full resize-none rounded-2xl border border-highlight/10 bg-highlight/[0.04] px-4 py-3 text-sm text-highlight placeholder-highlight/25 outline-none transition focus:border-[#F500F1]/40 focus:ring-1 focus:ring-[#F500F1]/20 disabled:opacity-50"
          />
        </div>

        <StatusFeedback error={error} success={success} />

        <SubmitButton isPending={isPending} success={success} />
      </form>
    </div>
  );
}

// ─── Sección: Servicios ──────────────────────────────────────────────────────

function ServicesSection({
  driverServicios,
  allServices,
  onClose,
}: {
  driverServicios: ServiceTypeDto[];
  allServices: ServiceTypeDto[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const enabledIds = new Set(driverServicios.map((s) => s.id));

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateDriverServices(formData);
        setSuccess(true);
        setTimeout(onClose, 800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  return (
    <div>
      <SectionHeader
        title="Mis servicios"
        subtitle="Seleccioná los trabajos que podés realizar"
      />

      <form action={handleSubmit} className="mt-8">
        <div className="space-y-3">
          {allServices.map((service) => (
            <label
              key={service.id}
              className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                enabledIds.has(service.id)
                  ? "border-[#F500F1]/30 bg-[#F500F1]/5"
                  : "border-highlight/8 bg-highlight/[0.02] hover:border-highlight/15 hover:bg-highlight/[0.04]"
              }`}
            >
              <input
                type="checkbox"
                name="servicios"
                value={service.id}
                defaultChecked={enabledIds.has(service.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#F500F1]"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-highlight">
                  {service.nombre}
                </p>
                <p className="mt-0.5 text-xs text-highlight/45">
                  {service.descripcion}
                </p>
                <p className="mt-2 text-xs font-bold text-[#C392DD]">
                  ${service.precioBase.toLocaleString()} base
                </p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6">
          <StatusFeedback error={error} success={success} />
          <SubmitButton isPending={isPending} success={success} />
        </div>
      </form>
    </div>
  );
}

// ─── Sección: Foto de perfil ─────────────────────────────────────────────────

function PhotoSection({
  driver,
  onClose,
}: {
  driver: DriverDashboardProfile;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(driver.imagenURL);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateProfilePhoto(formData);
        setSuccess(true);
        setTimeout(onClose, 800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al subir imagen");
      }
    });
  }

  return (
    <div>
      <SectionHeader
        title="Foto de perfil"
        subtitle="JPG, PNG o WEBP · Máximo 5MB"
      />

      <form action={handleSubmit} className="mt-8">
        {/* Preview */}
        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group relative"
          >
            <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-highlight/15 bg-highlight/5 shadow-2xl shadow-black/30">
              {preview ? (
                <Image
                  src={preview}
                  alt="Avatar"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-highlight/30">
                  {driver.nombre.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Overlay al hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
              <span className="text-2xl">📷</span>
            </div>

            {/* Badge */}
            <div className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-[#160822] bg-[#F500F1] text-xs shadow-lg">
              ✎
            </div>
          </button>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-sm font-semibold text-[#F500F1] underline-offset-2 hover:underline"
          >
            Seleccionar imagen
          </button>

          <input
            ref={inputRef}
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="mt-8">
          <StatusFeedback error={error} success={success} />
          <SubmitButton
            isPending={isPending}
            success={success}
            label="Subir foto"
          />
        </div>
      </form>
    </div>
  );
}

// ─── Subcomponentes reutilizables ────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-highlight/8 pb-5">
      <h2 className="text-2xl font-bold text-highlight">{title}</h2>
      <p className="mt-1 text-sm text-highlight/40">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  placeholder,
  required,
  minLength,
  disabled,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-highlight/45">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        disabled={disabled}
        className="w-full rounded-2xl border border-highlight/10 bg-highlight/[0.04] px-4 py-3 text-sm font-semibold text-highlight placeholder-highlight/25 outline-none transition focus:border-[#F500F1]/40 focus:ring-1 focus:ring-[#F500F1]/20 disabled:opacity-50"
      />
    </div>
  );
}

function StatusFeedback({
  error,
  success,
}: {
  error: string | null;
  success: boolean;
}) {
  if (error) {
    return (
      <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300">
        ✓ Guardado correctamente
      </p>
    );
  }
  return null;
}

function SubmitButton({
  isPending,
  success,
  label = "Guardar cambios",
}: {
  isPending: boolean;
  success: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={isPending || success}
      className="w-full rounded-2xl bg-[#F500F1] py-4 text-sm font-bold text-white shadow-lg shadow-[#F500F1]/20 transition hover:bg-[#d400d0] disabled:opacity-60"
    >
      {isPending ? "Guardando…" : success ? "✓ Guardado" : label}
    </button>
  );
}
