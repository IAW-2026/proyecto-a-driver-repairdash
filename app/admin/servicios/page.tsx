import { requireAdmin } from "@/lib/auth/roles";
import { getServiceTypes } from "@/lib/services/admin/service-tipos-de-servicios";

import { AdminServiciosView } from "./components/admin-servicios-view";

export default async function AdminServiciosPage() {
  await requireAdmin();

  const services = await getServiceTypes();

  return <AdminServiciosView services={services} />;
}
