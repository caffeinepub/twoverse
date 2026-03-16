import { CheckCircle2, Circle, Star, Trophy } from "lucide-react";
import { useState } from "react";

interface Mission {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: string;
  emoji: string;
}

const WEEKLY_MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "Morning Voice Note",
    description:
      "Send a voice message or long text saying good morning to all members.",
    xp: 50,
    category: "Communication",
    emoji: "🌅",
  },
  {
    id: "m2",
    title: "Memory Lane",
    description:
      "Each member adds at least one photo memory to the vault this week.",
    xp: 75,
    category: "Memories",
    emoji: "📸",
  },
  {
    id: "m3",
    title: "Gratitude Chain",
    description: "Tell each other one thing you're grateful for about them.",
    xp: 60,
    category: "Bonding",
    emoji: "💌",
  },
  {
    id: "m4",
    title: "Daily Check-in Streak",
    description: "All members check in every day for 3 days straight.",
    xp: 100,
    category: "Consistency",
    emoji: "🔥",
  },
  {
    id: "m5",
    title: "Surprise Message",
    description: "Send a heartfelt surprise message to someone in the group.",
    xp: 40,
    category: "Love",
    emoji: "💝",
  },
];

const STORAGE_KEY = "twoverse_missions_completed";

function getCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveCompleted(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

export function MissionsPage() {
  const [completed, setCompleted] = useState<Set<string>>(getCompleted);

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveCompleted(next);
      return next;
    });
  };

  const totalXp = WEEKLY_MISSIONS.filter((m) => completed.has(m.id)).reduce(
    (acc, m) => acc + m.xp,
    0,
  );
  const maxXp = WEEKLY_MISSIONS.reduce((acc, m) => acc + m.xp, 0);
  const progress = Math.round((totalXp / maxXp) * 100);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-4">
      {/* XP Summary */}
      <div
        data-ocid="missions.xp_card"
        className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-6 text-center border border-amber-100 shadow-soft"
      >
        <div className="flex justify-center mb-2">
          <Trophy className="text-amber-400" size={28} />
        </div>
        <div className="text-4xl font-bold text-amber-500 font-serif">
          {totalXp}
        </div>
        <div className="text-xs text-amber-600 uppercase tracking-widest mt-1 font-medium">
          XP this week
        </div>
        <div className="mt-4 bg-amber-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-amber-400 to-yellow-400 h-2 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-amber-500 mt-1">
          {totalXp} / {maxXp} XP
        </div>
      </div>

      {/* Mission list */}
      <div className="flex flex-col gap-3">
        {WEEKLY_MISSIONS.map((mission, i) => {
          const done = completed.has(mission.id);
          return (
            <button
              type="button"
              key={mission.id}
              data-ocid={`missions.item.${i + 1}`}
              onClick={() => toggle(mission.id)}
              className={`w-full text-left flex gap-3 items-start p-4 rounded-2xl border transition-all duration-200 ${
                done
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-pink-100 hover:border-pink-300 shadow-soft"
              }`}
            >
              <span className="text-2xl flex-shrink-0">{mission.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span
                    className={`font-semibold text-sm ${
                      done ? "text-green-600 line-through" : "text-foreground"
                    }`}
                  >
                    {mission.title}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold flex-shrink-0 ml-2">
                    <Star size={11} fill="currentColor" />
                    {mission.xp} XP
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mission.description}
                </p>
                <span className="text-[10px] text-pink-400 font-medium mt-1 inline-block">
                  {mission.category}
                </span>
              </div>
              <div className="flex-shrink-0 mt-0.5">
                {done ? (
                  <CheckCircle2 size={20} className="text-green-500" />
                ) : (
                  <Circle size={20} className="text-gray-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {completed.size === WEEKLY_MISSIONS.length && (
        <div
          data-ocid="missions.success_state"
          className="text-center py-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-100"
        >
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-serif italic text-pink-500 text-lg">
            All missions complete!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You're amazing together 💕
          </p>
        </div>
      )}
    </div>
  );
}
