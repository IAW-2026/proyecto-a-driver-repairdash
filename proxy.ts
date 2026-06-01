import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import {
  NextResponse,
} from "next/server";
import {
  isRiderRole,
} from "@/lib/auth/get-user-role";

const isPublicRoute =
  createRouteMatcher([
    "/",
    "/login(.*)",
    "/sign-up(.*)",
    "/cuenta-rider",
    "/__clerk(.*)",
    "/api/webhooks(.*)",
    "/api/mocks/(.*)",
    "/api/trabajos/state",
    "/api/tipos-servicios",
    "/api/drivers/(.*)",
  ]);

export default clerkMiddleware(
  async (
    auth,
    req,
  ) => {
    if (
      isPublicRoute(
        req,
      )
    ) {
      return;
    }

    const {
      userId,
      sessionClaims,
      redirectToSignIn,
    } =
      await auth();

    if (!userId) {
      return redirectToSignIn();
    }

    const claims =
      sessionClaims as
        | {
            metadata?: {
              role?: string;
            };
            publicMetadata?: {
              role?: string;
            };
          }
        | undefined;

    const role =
      claims?.metadata?.role ??
      claims?.publicMetadata?.role;

    if (
      isRiderRole(
        role,
      ) &&
      req.nextUrl.pathname !==
        "/cuenta-rider"
    ) {
      return NextResponse.redirect(
        new URL(
          "/cuenta-rider",
          req.url,
        ),
      );
    }

    // Admin bypass
    if (
      role ===
      "driver-admin"
    ) {
      return;
    }
  },
  {
    clockSkewInMs:
      process.env.NODE_ENV ===
      "production"
        ? 5_000
        : 5 *
          60_000,
  },
);

export const config =
  {
    matcher: [
      "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      "/(api|trpc)(.*)",
      "/__clerk/(.*)",
    ],
  };
