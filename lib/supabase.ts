import { createClient } from "@supabase/supabase-js";

export const AVATARS_BUCKET =
  "avatars";

const SIGNED_AVATAR_TTL_SECONDS =
  60 * 60 * 24 * 7;

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

  const safeDriverId =
    driverId.replace(
      /[^a-zA-Z0-9-_]/g,
      "_",
    );

  const fileName =
    `avatar-${Date.now()}.${ext}`;

  const path =
    `drivers/${safeDriverId}/${fileName}`;

  const arrayBuffer =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(
      arrayBuffer,
    );

  const { error } =
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

  return path;
}

export async function getAvatarDisplayUrl(
  storedAvatar:
    | string
    | null
    | undefined,
): Promise<string | null> {
  if (!storedAvatar?.trim()) {
    return null;
  }

  const trimmedAvatar =
    storedAvatar.trim();

  const avatarPath =
    extractAvatarPath(
      trimmedAvatar,
    );

  if (!avatarPath) {
    return trimmedAvatar;
  }

  const supabaseAdmin =
    getSupabaseAdmin();

  const { data, error } =
    await supabaseAdmin.storage
      .from(
        AVATARS_BUCKET,
      )
      .createSignedUrl(
        avatarPath,
        SIGNED_AVATAR_TTL_SECONDS,
      );

  if (error) {
    console.error(
      "Error generando URL firmada de avatar:",
      error,
    );

    return null;
  }

  return data.signedUrl;
}

function extractAvatarPath(
  storedAvatar: string,
) {
  if (
    !storedAvatar.startsWith(
      "http://",
    ) &&
    !storedAvatar.startsWith(
      "https://",
    )
  ) {
    return storedAvatar;
  }

  try {
    const url =
      new URL(storedAvatar);

    const publicMarker =
      `/storage/v1/object/public/${AVATARS_BUCKET}/`;

    const signedMarker =
      `/storage/v1/object/sign/${AVATARS_BUCKET}/`;

    const marker =
      url.pathname.includes(
        publicMarker,
      )
        ? publicMarker
        : url.pathname.includes(
              signedMarker,
            )
          ? signedMarker
          : null;

    if (!marker) {
      return null;
    }

    return decodeURIComponent(
      url.pathname.split(marker)[1] ??
        "",
    );
  } catch {
    return null;
  }
}
