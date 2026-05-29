import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isPublicRoute =
  createRouteMatcher([
    "/",
    "/login(.*)",
    "/sign-up(.*)",
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

    const metadata =
      sessionClaims?.metadata as
        | {
            role?: string;
          }
        | undefined;

    const role =
      metadata?.role;
    // Admin bypass
    if (
      role ===
      "admin"
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
