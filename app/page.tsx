"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const currentUserId = session?.user?.email;
    const stored = localStorage.getItem("nutrisathi-store");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const profile = data?.state?.profile;
        if (profile && profile.userId === currentUserId) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // ignore
      }
    }
    router.replace("/setup");
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#ff7c2a] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
