import { Link, useLocation } from "@tanstack/react-router";
import { Grid3X3, Heart, Home, Image, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home, ocid: "nav.dashboard_tab" },
  { to: "/chat", label: "Chat", icon: MessageCircle, ocid: "nav.chat_tab" },
  { to: "/vault", label: "Memories", icon: Image, ocid: "nav.vault_tab" },
  { to: "/prompts", label: "Check-in", icon: Heart, ocid: "nav.prompts_tab" },
  { to: "/more", label: "More", icon: Grid3X3, ocid: "nav.more_tab" },
];

export function BottomNav() {
  const location = useLocation();

  const moreSubPaths = [
    "/more",
    "/missions",
    "/analytics",
    "/anniversary",
    "/time-capsule",
    "/quiz",
    "/settings",
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-pink-100 z-30">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon, ocid }) => {
          let active: boolean;
          if (to === "/") {
            active = location.pathname === "/";
          } else if (to === "/more") {
            active = moreSubPaths.some(
              (p) => location.pathname.startsWith(p) && p !== "/",
            );
          } else {
            active = location.pathname.startsWith(to);
          }
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 transition-all duration-200",
                active ? "text-pink-500" : "text-gray-400 hover:text-pink-400",
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
