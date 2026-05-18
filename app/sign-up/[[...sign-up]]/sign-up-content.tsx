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
  } = useUser();

  const initialized =
    useRef(false);

  useEffect(() => {
    async function onboardDriver() {
      if (
        initialized.current
      ) {
        return;
      }

      initialized.current =
        true;

      try {
        await fetch(
          "/api/onboarding/driver",
          {
            method:
              "POST",
          },
        );

        window.location.replace(
          "/",
        );
      } catch (
        error
      ) {
        console.error(
          error,
        );
      }
    }

    if (
      isLoaded &&
      isSignedIn
    ) {
      onboardDriver();
    }
  }, [
    isLoaded,
    isSignedIn,
  ]);

  if (
    !isLoaded ||
    isSignedIn
  ) {
    return null;
  }

  return (
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/login"
      forceRedirectUrl="/"
      fallbackRedirectUrl="/"
    />
  );
}