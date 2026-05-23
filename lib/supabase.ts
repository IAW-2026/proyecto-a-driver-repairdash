import { createClient } from "@supabase/supabase-js";

export const AVATARS_BUCKET =
  "avatars";

export async function uploadAvatar(
  driverId: string,
  file: File,
): Promise<string> {
  const supabaseAdmin =
    getSupabaseAdmin();

  const ext =
    file.name.split(".").pop() ??
    "jpg";

  const safeDriverId = driverId
  .replace(/[^a-zA-Z0-9-_]/g, "_");

  const fileName =
    `avatar-${Date.now()}.${ext}`;

  const path =
    `drivers/${safeDriverId}/${fileName}`;

  const { error } =
    await supabaseAdmin.storage
      .from(AVATARS_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

  if (error) {
    throw new Error(
      `Error subiendo imagen: ${error.message}`,
    );
  }

  // URL PUBLICA (NO SIGNED)
  const {
    data: { publicUrl },
  } =
    supabaseAdmin.storage
      .from(
        AVATARS_BUCKET,
      )
      .getPublicUrl(path);

  return `${publicUrl}?t=${Date.now()}`;
}

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !supabaseServiceKey
  ) {
    throw new Error(
      "Supabase no esta configurado. Defini NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseServiceKey,
  );
}
