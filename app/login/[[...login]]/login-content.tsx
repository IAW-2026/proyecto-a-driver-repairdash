"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function LoginContent() {
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
    <SignIn
      path="/login"
      routing="path"
      signUpUrl="/sign-up"
      forceRedirectUrl="/"
      fallbackRedirectUrl="/"
    />
  );
}
