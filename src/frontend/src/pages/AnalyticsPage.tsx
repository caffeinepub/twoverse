import { useCallback, useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Emotion } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { todayStr } from "../lib/helpers";

const emotionConfig: Record<
  Emotion,
  { label: string; emoji: string; color: string }
> = {
  [Emotion.happy]: { label: "Happy", emoji: "😊", color: "#f472b6" },
  [Emotion.calm]: { label: "Calm", emoji: "😌", color: "#a78bfa" },
  [Emotion.excited]: { label: "Excited", emoji: "🎉", color: "#fb923c" },
  [Emotion.tired]: { label: "Tired", emoji: "😴", color: "#94a3b8" },
  [Emotion.stressed]: { label: "Stressed", emoji: "😤", color: "#f87171" },
  [Emotion.sad]: { label: "Sad", emoji: "😢", color: "#60a5fa" },
};

// Mock weekly data for demo
const MOCK_WEEKLY: {
  day: string;
  emotions: Partial<Record<Emotion, number>>;
}[] = [
  { day: "Mon", emotions: { [Emotion.happy]: 2, [Emotion.calm]: 1 } },
  { day: "Tue", emotions: { [Emotion.excited]: 2, [Emotion.happy]: 1 } },
  { day: "Wed", emotions: { [Emotion.tired]: 2, [Emotion.stressed]: 1 } },
  { day: "Thu", emotions: { [Emotion.calm]: 3 } },
  { day: "Fri", emotions: { [Emotion.happy]: 2, [Emotion.excited]: 1 } },
  { day: "Sat", emotions: { [Emotion.happy]: 3 } },
  { day: "Sun", emotions: { [Emotion.calm]: 2, [Emotion.happy]: 1 } },
];

function generateInsight(data: { emotion: Emotion }[]): string {
  if (data.length === 0)
    return "No check-ins today. Encourage each other to share how they feel!";
  const counts: Partial<Record<Emotion, number>> = {};
  for (const d of data) {
    counts[d.emotion] = (counts[d.emotion] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return "Keep checking in together!";
  const [emotion] = top;
  const cfg = emotionConfig[emotion as Emotion];
  if (emotion === Emotion.happy || emotion === Emotion.excited) {
    return `Your group is feeling ${cfg.label.toLowerCase()} today ${cfg.emoji} — keep spreading those good vibes!`;
  }
  if (emotion === Emotion.stressed || emotion === Emotion.tired) {
    return `Looks like the group is feeling ${cfg.label.toLowerCase()} ${cfg.emoji}. Maybe plan something cozy together tonight?`;
  }
  return `Your group vibe today is ${cfg.label.toLowerCase()} ${cfg.emoji} — cherish this quiet energy.`;
}

export function AnalyticsPage() {
  const { actor } = useActor();
  const [todayData, setTodayData] = useState<{ emotion: Emotion }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!actor) return;
    const data = await actor.getTodayCheckIns(todayStr());
    setTodayData(data);
    setLoading(false);
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  // Build pie data from today
  const pieData = Object.entries(
    todayData.reduce<Record<string, number>>((acc, d) => {
      acc[d.emotion] = (acc[d.emotion] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([emotion, count]) => ({
    name: emotionConfig[emotion as Emotion]?.label ?? emotion,
    value: count,
    color: emotionConfig[emotion as Emotion]?.color ?? "#f472b6",
    emoji: emotionConfig[emotion as Emotion]?.emoji ?? "💭",
  }));

  const insight = generateInsight(todayData);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">
      {/* Insight */}
      <div
        data-ocid="analytics.insight_card"
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 shadow-soft"
      >
        <div className="text-xs font-semibold text-purple-400 uppercase tracking-widest mb-2">
          Today's Insight
        </div>
        <p className="text-foreground text-sm leading-relaxed font-serif italic">
          "{insight}"
        </p>
      </div>

      {/* Today's check-in pie */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4">
          Today's Mood Distribution
        </div>
        {loading ? (
          <div
            data-ocid="analytics.loading_state"
            className="flex justify-center py-8"
          >
            <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pieData.length === 0 ? (
          <div
            data-ocid="analytics.empty_state"
            className="text-center py-8 text-muted-foreground"
          >
            <p className="text-sm">No check-ins yet today</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #fce7f3",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 flex-1">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-xs text-foreground">
                    {d.emoji} {d.name} ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Weekly trend (mock) */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4">
          This Week's Vibes
        </div>
        <div className="flex gap-2 items-end justify-between">
          {MOCK_WEEKLY.map((day) => {
            const total = Object.values(day.emotions).reduce(
              (a, b) => a + b,
              0,
            );
            const topEmotion = Object.entries(day.emotions).sort(
              (a, b) => b[1] - a[1],
            )[0]?.[0] as Emotion | undefined;
            const color = topEmotion
              ? emotionConfig[topEmotion]?.color
              : "#fce7f3";
            const height = Math.max(20, total * 16);
            return (
              <div
                key={day.day}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}px`,
                    backgroundColor: color,
                    opacity: 0.8,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emotion legend */}
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-pink-100">
        <div className="grid grid-cols-3 gap-2">
          {Object.values(emotionConfig).map((cfg) => (
            <div key={cfg.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              <span className="text-xs text-muted-foreground">
                {cfg.emoji} {cfg.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
