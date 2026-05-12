"use client";

import { useState } from "react";

export type Service = {
  id: string;
  nombre: string;
  descripcion: string;
  precioBase: number;
};

type Props = {
  service: Service;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
};

export function ServiceCard({ service, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await onUpdate(service.id, formData);
          setEditing(false);
        }}
        className="rounded-xl border p-4 space-y-3"
      >
        <input
          name="nombre"
          defaultValue={service.nombre}
          className="w-full rounded border p-2 text-black"
        />
        <textarea
          name="descripcion"
          defaultValue={service.descripcion}
          className="w-full rounded border p-2 text-black"
        />
        <input
          name="precioBase"
          type="number"
          defaultValue={service.precioBase}
          className="w-full rounded border p-2 text-black"
        />
        <div className="flex gap-2">
          <button type="submit" className="rounded bg-green-600 px-3 py-2">
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded bg-gray-500 px-3 py-2"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold">{service.nombre}</h2>
          <p className="text-sm opacity-70">{service.descripcion}</p>
          <p className="mt-2 font-medium">${service.precioBase}</p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="rounded bg-blue-500 px-3 py-2"
        >
          Editar
        </button>
      </div>
    </div>
  );
}