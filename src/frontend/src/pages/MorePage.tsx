import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Lock,
  Settings,
  Swords,
} from "lucide-react";

const items = [
  {
    to: "/missions",
    icon: Swords,
    label: "Missions",
    desc: "Weekly bond challenges & XP",
    color: "bg-amber-50 text-amber-500",
    ocid: "more.missions_link",
  },
  {
    to: "/analytics",
    icon: BarChart3,
    label: "Bond Analytics",
    desc: "Mood trends & insights",
    color: "bg-purple-50 text-purple-500",
    ocid: "more.analytics_link",
  },
  {
    to: "/anniversary",
    icon: Calendar,
    label: "Anniversary",
    desc: "Milestones & countdown",
    color: "bg-rose-50 text-rose-500",
    ocid: "more.anniversary_link",
  },
  {
    to: "/time-capsule",
    icon: Lock,
    label: "Time Capsule",
    desc: "Future messages for you",
    color: "bg-teal-50 text-teal-500",
    ocid: "more.timecapsule_link",
  },
  {
    to: "/quiz",
    icon: BookOpen,
    label: "Quiz",
    desc: "Compatibility & fun questions",
    color: "bg-blue-50 text-blue-500",
    ocid: "more.quiz_link",
  },
  {
    to: "/settings",
    icon: Settings,
    label: "Settings",
    desc: "Name, date, invite code",
    color: "bg-gray-50 text-gray-500",
    ocid: "more.settings_link",
  },
];

export function MorePage() {
  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <p className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4">
        Explore
      </p>
      <div className="grid grid-cols-1 gap-3">
        {items.map(({ to, icon: Icon, label, desc, color, ocid }) => (
          <Link
            key={to}
            to={to}
            data-ocid={ocid}
            className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-soft border border-pink-50 hover:border-pink-200 transition-all duration-200 hover:shadow-card active:scale-[0.98]"
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
            >
              <Icon size={20} />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">
                {label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </div>
            <div className="ml-auto text-gray-300 text-lg">›</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
