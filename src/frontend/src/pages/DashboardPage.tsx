import { useNavigate } from "@tanstack/react-router";
import { Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { T__1 as CheckIn } from "../backend.d";
import { Button } from "../components/ui/button";
import { useLocalAuth } from "../contexts/LocalAuthContext";
import { useActor } from "../hooks/useActor";
import {
  computeDaysTogether,
  getDayOfYear,
  getNextAnniversary,
  todayStr,
} from "../lib/helpers";

const emotionEmoji: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  stressed: "😤",
  tired: "😴",
  excited: "🎉",
  sad: "😢",
};

export function DashboardPage() {
  const { actor } = useActor();
  const { sessionId, name: userName } = useLocalAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [prompt, setPrompt] = useState("");
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || !sessionId) return;
    const load = async () => {
      try {
        const [sd, dailyPrompt, todayCheckIns] = await Promise.all([
          actor.getStartDate(),
          actor.getDailyPrompt(getDayOfYear(new Date())),
          actor.getTodayCheckIns(todayStr()),
        ]);
        setStartDate(sd);
        setDays(computeDaysTogether(sd));
        setPrompt(dailyPrompt);
        setCheckIns(todayCheckIns);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actor, sessionId]);

  const nextAnniv = getNextAnniversary(startDate);

  return (
    <div className="flex flex-col gap-4 py-5 px-4 max-w-lg mx-auto">
      {userName && (
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Hello,{" "}
            <span className="font-serif italic text-pink-500">{userName}</span>{" "}
            💕
          </p>
        </div>
      )}

      <div
        data-ocid="dashboard.days_together"
        className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 rounded-3xl p-7 text-center shadow-soft border border-pink-100"
      >
        <div className="flex justify-center mb-3">
          <Heart
            className="text-pink-400 float-heart"
            size={26}
            fill="currentColor"
          />
        </div>
        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-7xl font-bold text-pink-500 font-serif">
              {days}
            </div>
            <div className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-widest">
              {days === 1 ? "day together" : "days together"}
            </div>
          </>
        )}
      </div>

      {nextAnniv && (
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-pink-100 flex items-center gap-3">
          <div className="text-2xl">🗓</div>
          <div>
            <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest">
              Next Anniversary
            </div>
            <div className="text-sm text-foreground font-medium mt-0.5">
              {nextAnniv.years} year{nextAnniv.years !== 1 ? "s" : ""} — in{" "}
              <span className="text-pink-500 font-bold">
                {nextAnniv.daysAway}
              </span>{" "}
              {nextAnniv.daysAway === 1 ? "day" : "days"}
            </div>
          </div>
        </div>
      )}

      <div
        data-ocid="dashboard.prompt_teaser"
        className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={12} className="text-pink-400" />
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest">
            Today's Prompt
          </div>
        </div>
        <p className="text-foreground text-sm leading-relaxed font-serif italic">
          {prompt
            ? `"${prompt.length > 100 ? `${prompt.slice(0, 100)}...` : prompt}"`
            : "Loading..."}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Group Vibes Today
        </div>
        {checkIns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-1">
            No check-ins yet today
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {checkIns.map((ci, idx) => (
              <div
                key={`${ci.date}-${ci.emotion}-${idx}`}
                className="flex items-center gap-1.5 bg-pink-50 rounded-full px-3 py-1.5 text-sm text-foreground"
              >
                <span>{emotionEmoji[ci.emotion] ?? "💭"}</span>
                <span className="capitalize">{ci.emotion}</span>
              </div>
            ))}
          </div>
        )}
        <Button
          data-ocid="dashboard.checkin_button"
          onClick={() => navigate({ to: "/prompts" })}
          className="w-full mt-4 bg-pink-400 hover:bg-pink-500 text-white rounded-2xl shadow-glow"
          size="sm"
        >
          Check in today ✨
        </Button>
      </div>
    </div>
  );
}
