import { useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import type { Emotion } from "../backend.d";
import { Button } from "../components/ui/button";
import { useActor } from "../hooks/useActor";
import { computeDaysTogether, getDayOfYear, todayStr } from "../lib/utils";

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
  const navigate = useNavigate();
  const [days, setDays] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [checkIns, setCheckIns] = useState<
    { emotion: Emotion; date: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    const load = async () => {
      try {
        const [startDate, dailyPrompt, todayCheckIns] = await Promise.all([
          actor.getStartDate(),
          actor.getDailyPrompt(getDayOfYear(new Date())),
          actor.getTodayCheckIns(todayStr()),
        ]);
        setDays(computeDaysTogether(startDate));
        setPrompt(dailyPrompt);
        setCheckIns(todayCheckIns);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor]);

  const promptTeaser =
    prompt.length > 80 ? `${prompt.slice(0, 80)}...` : prompt;

  return (
    <div className="flex flex-col gap-5 py-4 px-4 max-w-lg mx-auto">
      <div
        data-ocid="dashboard.days_together"
        className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 text-center shadow-sm border border-pink-100"
      >
        <div className="flex justify-center mb-2">
          <Heart className="text-pink-400" size={28} fill="currentColor" />
        </div>
        {loading ? (
          <div className="h-16 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-6xl font-bold text-pink-500">{days}</div>
            <div className="text-sm text-gray-400 mt-1">
              {days === 1 ? "day together" : "days together"}
            </div>
          </>
        )}
      </div>

      <div
        data-ocid="dashboard.prompt_teaser"
        className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100"
      >
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-2">
          Today's Prompt
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {promptTeaser || "Loading..."}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Today's Check-ins
        </div>
        {checkIns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">
            No check-ins yet today
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {checkIns.map((ci) => (
              <div
                key={`${ci.date}-${ci.emotion}`}
                className="flex items-center gap-1.5 bg-pink-50 rounded-full px-3 py-1.5 text-sm text-gray-600"
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
          className="w-full mt-4 bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
          size="sm"
        >
          Check in today
        </Button>
      </div>
    </div>
  );
}
