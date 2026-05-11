import { redirect } from "next/navigation";
import { getCurrentDriverProfile } from "@/lib/services/driver.service";
import { getServiceTypes } from "@/lib/services/admin/service-tipos-de-servicios";
import {
  createServiceType,
  deleteServiceType,
  updateServiceType,
} from "./actions";
import { ServiceCard } from "./service-card";

export default async function AdminServiciosPage() {
  const driver = await getCurrentDriverProfile();

  if (driver.role !== "ADMIN") {
    redirect("/");
  }

  const services = await getServiceTypes();

  return (
    <div className="p-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Tipos de trabajo
        </h1>

        <form
          action={createServiceType}
          className="mb-8 rounded-xl border p-4 space-y-3"
        >
          <h2 className="font-bold">
            Crear servicio
          </h2>

          <input
            name="nombre"
            placeholder="Nombre"
            className="w-full rounded border p-2 text-black"
            required
          />

          <textarea
            name="descripcion"
            placeholder="Descripción"
            className="w-full rounded border p-2 text-black"
            required
          />

          <input
            name="precioBase"
            type="number"
            placeholder="Precio base"
            className="w-full rounded border p-2 text-black"
            required
          />

          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2"
          >
            Crear servicio
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="flex gap-4">
            <div className="flex-1">
              <ServiceCard
                service={service}
                onUpdate={async (id, formData) => {
                  "use server";
                  await updateServiceType(id, formData);
                }}
              />
            </div>

            <form
              action={async () => {
                "use server";
                await deleteServiceType(service.id);
              }}
            >
              <button
                type="submit"
                className="rounded bg-red-500 px-4 py-2 text-white"
              >
                Eliminar
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}