import { useCallback, useEffect, useState } from "react";
import { Emotion } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { cn, getDayOfYear, todayStr } from "../lib/utils";

const emotions: { value: Emotion; label: string; emoji: string }[] = [
  { value: Emotion.happy, label: "Happy", emoji: "😊" },
  { value: Emotion.calm, label: "Calm", emoji: "😌" },
  { value: Emotion.stressed, label: "Stressed", emoji: "😤" },
  { value: Emotion.tired, label: "Tired", emoji: "😴" },
  { value: Emotion.excited, label: "Excited", emoji: "🎉" },
  { value: Emotion.sad, label: "Sad", emoji: "😢" },
];

export function PromptsPage() {
  const { actor } = useActor();
  const [prompt, setPrompt] = useState("");
  const [myCheckIn, setMyCheckIn] = useState<Emotion | null>(null);
  const [allCheckIns, setAllCheckIns] = useState<{ emotion: Emotion }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const today = todayStr();

  const load = useCallback(async () => {
    if (!actor) return;
    const [p, mine, all] = await Promise.all([
      actor.getDailyPrompt(getDayOfYear(new Date())),
      actor.getUserCheckIn(today),
      actor.getTodayCheckIns(today),
    ]);
    setPrompt(p);
    setMyCheckIn(mine ? mine.emotion : null);
    setAllCheckIns(all);
  }, [actor, today]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (emotion: Emotion) => {
    if (!actor || myCheckIn !== null) return;
    setSubmitting(true);
    try {
      await actor.submitCheckIn(today, emotion);
      setMyCheckIn(emotion);
      const all = await actor.getTodayCheckIns(today);
      setAllCheckIns(all);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 shadow-sm border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Today's Prompt
        </div>
        <p className="text-gray-700 text-base leading-relaxed">
          {prompt || "Loading..."}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          How are you feeling?
        </div>
        {myCheckIn !== null ? (
          <div className="text-center py-3">
            <div className="text-4xl mb-2">
              {emotions.find((e) => e.value === myCheckIn)?.emoji}
            </div>
            <p className="text-sm text-gray-500">
              You're feeling{" "}
              <span className="font-semibold text-pink-500 capitalize">
                {myCheckIn}
              </span>{" "}
              today. 💕
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {emotions.map(({ value, label, emoji }) => (
              <button
                type="button"
                key={value}
                data-ocid={`prompts.emotion_${value}`}
                onClick={() => submit(value)}
                disabled={submitting}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border-2 border-pink-100",
                  "transition-all duration-200 hover:scale-105 hover:border-pink-300 hover:bg-pink-50",
                  submitting && "opacity-50 cursor-not-allowed",
                )}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-medium text-gray-600">
                  {label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {allCheckIns.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
            Everyone today
          </div>
          <div className="flex flex-wrap gap-2">
            {allCheckIns.map((ci) => {
              const found = emotions.find((e) => e.value === ci.emotion);
              return (
                <div
                  key={ci.emotion}
                  className="flex items-center gap-1.5 bg-pink-50 rounded-full px-3 py-1.5 text-sm text-gray-600"
                >
                  <span>{found?.emoji ?? "💭"}</span>
                  <span className="capitalize">{ci.emotion}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
