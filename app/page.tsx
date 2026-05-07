"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("nutrisathi-store");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data?.state?.profile) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // ignore
      }
    }
    router.replace("/setup");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff7c2a] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
