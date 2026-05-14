import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth/api-key";
import { getServiceTypes } from "@/lib/services/admin/service-tipos-de-servicios";

export async function GET(req: NextRequest) {
  const authorized = validateApiKey(req, [
    process.env.RIDER_APP_API_KEY!,
  ]);

  if (!authorized) {
    return NextResponse.json(
      {
        status: "error",
        mensaje: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const services = await getServiceTypes();

  return NextResponse.json({
    status: "success",
    mensaje: "Tipos de servicio obtenidos correctamente",
    data: services,
  });
}