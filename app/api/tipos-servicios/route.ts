import { NextRequest, NextResponse } from "next/server";
import { validateInternalApiKey } from "@/lib/auth/internal-auth";
import { getServiceTypes } from "@/lib/services/admin/service-tipos-de-servicios";

export async function GET(req: NextRequest) {
  const authError =
    validateInternalApiKey(
      req,
    );

  if (authError)
    return authError;

  const services = await getServiceTypes();

  return NextResponse.json({
    status: "success",
    mensaje: "Tipos de servicio obtenidos correctamente",
    data: services,
  });
}
