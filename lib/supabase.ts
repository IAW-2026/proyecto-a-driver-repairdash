import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente con service role — solo usar en server actions y API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const AVATARS_BUCKET = "avatars";

export async function uploadAvatar(
  driverId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `drivers/${driverId}/avatar.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabaseAdmin.storage
    .from(AVATARS_BUCKET)
    .getPublicUrl(path);

  // Añadir cache-buster para que el browser actualice la imagen
  return `${data.publicUrl}?t=${Date.now()}`;
}
