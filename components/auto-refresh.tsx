"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AutoRefreshProps = {
  intervalMs?: number;
};

export function AutoRefresh({
  intervalMs = 10_000,
}: AutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    function refreshIfVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    const intervalId = window.setInterval(
      refreshIfVisible,
      intervalMs,
    );

    document.addEventListener(
      "visibilitychange",
      refreshIfVisible,
    );

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        refreshIfVisible,
      );
    };
  }, [intervalMs, router]);

  return null;
}
