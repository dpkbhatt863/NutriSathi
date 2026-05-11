"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { House, Bot, Search, User } from "lucide-react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type NavId = "home" | "ai" | "search" | "profile";

interface NavItem {
  id: NavId;
  label: string;
  icon: LucideIcon;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",    label: "Home",    icon: House,  href: "/dashboard" },
  { id: "ai",      label: "AI Chat", icon: Bot,    href: "/dashboard?tab=ai" },
  { id: "search",  label: "Search",  icon: Search, href: "/dashboard?tab=search" },
  { id: "profile", label: "Profile", icon: User,   href: "/setup" },
];

function getActiveId(pathname: string, tab: string | null): NavId {
  if (pathname === "/setup") return "profile";
  if (pathname === "/dashboard" || pathname === "/") {
    if (tab === "ai") return "ai";
    if (tab === "search") return "search";
    return "home";
  }
  return "home";
}

function BottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const activeId = getActiveId(pathname, tab);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#fbebd8]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ id, label, icon: Icon, href }) => {
          const isActive = activeId === id;
          return (
            <Link
              key={id}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
            >
              <div className="relative flex items-center justify-center w-11 h-9">
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-[#fff3e6]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  className="relative z-10 transition-colors duration-200"
                  color={isActive ? "#ff7c2a" : "#a89070"}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </div>
              {isActive && (
                <span className="text-[10px] font-700 text-[#ff7c2a] leading-none">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={null}>
      <BottomNavInner />
    </Suspense>
  );
}
