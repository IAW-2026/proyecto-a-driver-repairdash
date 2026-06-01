"use client";

import {
  SignUp,
  useUser,
} from "@clerk/nextjs";

import {
  useEffect,
  useRef,
} from "react";

export function SignUpContent() {
  const {
    isLoaded,
    isSignedIn,
    user,
  } = useUser();

  const onboardingStarted =
    useRef(false);

  useEffect(() => {
    async function runOnboarding() {
      if (
        onboardingStarted.current
      ) {
        return;
      }

      onboardingStarted.current =
        true;

      try {
        const response =
          await fetch(
            "/api/onboarding/driver",
            {
              method:
                "POST",
            },
          );

        const data =
          await response.json();

        console.log(
          "ONBOARDING:",
          data,
        );

        if (
          !response.ok
        ) {
          throw new Error(
            "Falló onboarding",
          );
        }

        await user?.reload();

        window.location.href =
          "/";
      } catch (
        error
      ) {
        console.error(
          "ONBOARDING ERROR:",
          error,
        );
      }
    }

    if (
      isLoaded &&
      isSignedIn
    ) {
      runOnboarding();
    }
  }, [
    isLoaded,
    isSignedIn,
    user,
  ]);
  
  if (!isLoaded) {
    return null;
  }

  return (
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/login"
      forceRedirectUrl="/sign-up"
      fallbackRedirectUrl="/sign-up"
    />
  );
}
