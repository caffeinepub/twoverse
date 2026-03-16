import { Link, useLocation } from "@tanstack/react-router";
import { Heart, Home, Image, MessageCircle, Settings } from "lucide-react";
import { cn } from "../lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home, ocid: "nav.dashboard_tab" },
  { to: "/chat", label: "Chat", icon: MessageCircle, ocid: "nav.chat_tab" },
  { to: "/vault", label: "Vault", icon: Image, ocid: "nav.vault_tab" },
  { to: "/prompts", label: "Prompts", icon: Heart, ocid: "nav.prompts_tab" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 z-10">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon, ocid }) => {
          const active =
            to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              data-ocid={ocid}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-200",
                active ? "text-pink-500" : "text-gray-400 hover:text-pink-400",
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link
          to="/settings"
          data-ocid="nav.settings_link"
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-200",
            location.pathname === "/settings"
              ? "text-pink-500"
              : "text-gray-400 hover:text-pink-400",
          )}
        >
          <Settings
            size={22}
            strokeWidth={location.pathname === "/settings" ? 2.5 : 1.8}
          />
          <span className="text-[10px] font-medium">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
