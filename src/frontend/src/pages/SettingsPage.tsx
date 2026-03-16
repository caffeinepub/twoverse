import { Check, LogOut, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useLocalAuth } from "../contexts/LocalAuthContext";
import { THEMES, useTheme } from "../contexts/ThemeContext";
import { useActor } from "../hooks/useActor";

export function SettingsPage() {
  const { actor } = useActor();
  const { sessionId, name: authName, logout } = useLocalAuth();
  const { theme: activeTheme, setTheme } = useTheme();
  const [startDate, setStartDate] = useState("");
  const [displayName, setDisplayName] = useState(authName);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor.getStartDate().then((date) => {
      setStartDate(date || "");
    });
  }, [actor]);

  const save = async (section: string, fn: () => Promise<void>) => {
    setSaving(section);
    setSuccess(null);
    try {
      await fn();
      setSuccess(section);
      setTimeout(() => setSuccess(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      {/* Display Name */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Display Name
        </div>
        <Label htmlFor="set-name" className="text-xs text-gray-500">
          Your name
        </Label>
        <Input
          id="set-name"
          data-ocid="settings.name_input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 mb-3 rounded-xl border-pink-200"
        />
        <Button
          data-ocid="settings.save_name_button"
          onClick={() =>
            save("name", () =>
              actor!.saveProfile(sessionId, { name: displayName }),
            )
          }
          disabled={saving === "name"}
          size="sm"
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl w-full"
        >
          {saving === "name"
            ? "Saving..."
            : success === "name"
              ? "Saved ✓"
              : "Save Name"}
        </Button>
      </div>

      {/* Start Date */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Start Date
        </div>
        <Label htmlFor="set-date" className="text-xs text-gray-500">
          When did your story begin?
        </Label>
        <Input
          id="set-date"
          type="date"
          data-ocid="settings.start_date_input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 mb-3 rounded-xl border-pink-200"
        />
        <Button
          data-ocid="settings.save_start_date_button"
          onClick={() =>
            save("date", () => actor!.updateStartDate(sessionId, startDate))
          }
          disabled={saving === "date"}
          size="sm"
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl w-full"
        >
          {saving === "date"
            ? "Saving..."
            : success === "date"
              ? "Saved ✓"
              : "Save Date"}
        </Button>
      </div>

      {/* Customize Theme */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={14} className="text-pink-400" />
          <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest">
            Customize Theme
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Choose your app's look &amp; feel
        </p>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((t, i) => {
            const isActive = activeTheme.id === t.id;
            return (
              <button
                type="button"
                key={t.id}
                data-ocid={`settings.theme_card.${i + 1}`}
                onClick={() => setTheme(t.id)}
                className={[
                  "relative rounded-xl p-3 border-2 text-left transition-all duration-200 cursor-pointer",
                  isActive
                    ? "border-pink-400 shadow-md scale-[1.02]"
                    : "border-gray-100 hover:border-pink-200 hover:shadow-sm",
                ].join(" ")}
                style={{ background: t.gradient }}
              >
                <div className="flex gap-1.5 mb-2">
                  {t.preview.map((color) => (
                    <span
                      key={color}
                      className="w-4 h-4 rounded-full border border-white/50 shadow-sm flex-shrink-0"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <p
                  className="text-xs font-bold leading-tight"
                  style={{ color: t.isDark ? "#e2e8f0" : "#374151" }}
                >
                  {t.name}
                </p>
                <p
                  className="text-[10px] leading-tight mt-0.5"
                  style={{
                    color: t.isDark ? "rgba(226,232,240,0.6)" : "#9ca3af",
                  }}
                >
                  {t.description}
                </p>
                {isActive && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-400 flex items-center justify-center shadow">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        data-ocid="settings.logout_button"
        onClick={logout}
        variant="outline"
        className="w-full rounded-xl border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 mt-2"
      >
        <LogOut size={16} className="mr-2" /> Sign Out
      </Button>
    </div>
  );
}
