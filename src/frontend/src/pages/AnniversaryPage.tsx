import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { computeDaysTogether, getNextAnniversary } from "../lib/helpers";

const MILESTONES = [
  { days: 7, label: "One Week", emoji: "🌸" },
  { days: 30, label: "One Month", emoji: "🌹" },
  { days: 90, label: "3 Months", emoji: "💐" },
  { days: 180, label: "6 Months", emoji: "🌺" },
  { days: 365, label: "1 Year", emoji: "💍" },
  { days: 730, label: "2 Years", emoji: "✨" },
  { days: 1095, label: "3 Years", emoji: "💑" },
  { days: 1825, label: "5 Years", emoji: "🏆" },
];

function Hearts() {
  return (
    <div className="flex justify-center gap-2 my-4">
      {["h1", "h2", "h3", "h4", "h5"].map((id, i) => (
        <span
          key={id}
          className="text-2xl float-heart"
          style={{ animationDelay: `${i * 0.4}s` }}
        >
          💕
        </span>
      ))}
    </div>
  );
}

export function AnniversaryPage() {
  const { actor } = useActor();
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor.getStartDate().then((d) => {
      setStartDate(d ?? "");
      setLoading(false);
    });
  }, [actor]);

  const days = computeDaysTogether(startDate);
  const nextAnniv = getNextAnniversary(startDate);

  const reachedMilestones = MILESTONES.filter((m) => m.days <= days);
  const nextMilestone = MILESTONES.find((m) => m.days > days);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">
      {/* Main card */}
      <div
        data-ocid="anniversary.days_card"
        className="bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/50 rounded-3xl p-8 text-center border border-rose-100 shadow-soft"
      >
        <Hearts />
        {loading ? (
          <div className="h-20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-8xl font-bold text-pink-500 font-serif leading-none">
              {days}
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-medium uppercase tracking-widest">
              days together
            </div>
            {startDate && (
              <div className="text-xs text-muted-foreground mt-2">
                Since{" "}
                {new Date(startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Next anniversary countdown */}
      {nextAnniv && (
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100 text-center">
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-2">
            Next Anniversary
          </div>
          <div className="text-3xl font-bold text-foreground font-serif">
            {nextAnniv.daysAway} {nextAnniv.daysAway === 1 ? "day" : "days"}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {nextAnniv.years} year{nextAnniv.years !== 1 ? "s" : ""} on{" "}
            {nextAnniv.date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      )}

      {/* Next milestone */}
      {nextMilestone && (
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-pink-100 flex items-center gap-3">
          <span className="text-3xl">{nextMilestone.emoji}</span>
          <div>
            <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest">
              Next Milestone
            </div>
            <div className="font-semibold text-sm text-foreground mt-0.5">
              {nextMilestone.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {nextMilestone.days - days} more{" "}
              {nextMilestone.days - days === 1 ? "day" : "days"} to go
            </div>
          </div>
        </div>
      )}

      {/* Reached milestones */}
      {reachedMilestones.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-pink-100">
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
            Milestones Reached 🎉
          </div>
          <div className="flex flex-col gap-2">
            {reachedMilestones.map((m, i) => (
              <div
                key={m.days}
                data-ocid={`anniversary.milestone.item.${i + 1}`}
                className="flex items-center gap-3 py-2 border-b border-pink-50 last:border-0"
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-sm font-medium text-foreground">
                  {m.label}
                </span>
                <span className="ml-auto text-xs text-green-500 font-semibold">
                  ✓ Reached
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
