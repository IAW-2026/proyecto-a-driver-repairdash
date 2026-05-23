import { createClient } from "@supabase/supabase-js";

export const AVATARS_BUCKET =
  "avatars";

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL
      ?.trim()
      .replace(/\/$/, "");

  const supabaseServiceKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  

  if (
    !supabaseUrl ||
    !supabaseServiceKey
  ) {
    throw new Error(
      "Supabase no configurado",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        persistSession:
          false,
        autoRefreshToken:
          false,
      },
    },
  );
}

export async function uploadAvatar(
  driverId: string,
  file: File,
): Promise<string> {
  const supabaseAdmin =
    getSupabaseAdmin();

  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ??
    "jpg";

  // 🔥 Sanitizamos por seguridad
  const safeDriverId =
    driverId.replace(
      /[^a-zA-Z0-9-_]/g,
      "_",
    );

  const fileName =
    `avatar-${Date.now()}.${ext}`;

  const path =
    `drivers/${safeDriverId}/${fileName}`;

  

  // 🔥 Ver buckets reales
  const buckets =
    await supabaseAdmin.storage.listBuckets();

  

  // 🔥 Convertir File → Buffer
  const arrayBuffer =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(
      arrayBuffer,
    );

  const {
    data,
    error,
  } =
    await supabaseAdmin.storage
      .from(
        AVATARS_BUCKET,
      )
      .upload(
        path,
        buffer,
        {
          upsert: true,
          contentType:
            file.type,
        },
      );

  

  if (error) {
    throw new Error(
      `Error subiendo imagen: ${error.message}`,
    );
  }

  const {
    data: {
      publicUrl,
    },
  } =
    supabaseAdmin.storage
      .from(
        AVATARS_BUCKET,
      )
      .getPublicUrl(
        path,
      );

  return `${publicUrl}?t=${Date.now()}`;
}