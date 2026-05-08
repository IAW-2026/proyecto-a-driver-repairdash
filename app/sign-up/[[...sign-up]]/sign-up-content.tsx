"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SignUpContent() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.replace("/");
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || isSignedIn) {
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
