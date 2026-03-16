import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function SettingsPage() {
  const { actor } = useActor();
  const { clear } = useInternetIdentity();
  const [startDate, setStartDate] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getStartDate(), actor.getCallerUserProfile()]).then(
      ([date, profile]) => {
        setStartDate(date || "");
        if (profile) setDisplayName(profile.name);
      },
    );
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
              actor!.saveCallerUserProfile({ name: displayName }),
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
          onClick={() => save("date", () => actor!.updateStartDate(startDate))}
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

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-pink-100">
        <div className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">
          Invite Code
        </div>
        <Label htmlFor="set-invite" className="text-xs text-gray-500">
          Share this code with your people
        </Label>
        <Input
          id="set-invite"
          data-ocid="settings.invite_code_input"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter new invite code"
          className="mt-1 mb-3 rounded-xl border-pink-200"
        />
        <Button
          data-ocid="settings.save_invite_code_button"
          onClick={() =>
            save("invite", () => actor!.updateInviteCode(inviteCode))
          }
          disabled={saving === "invite" || !inviteCode.trim()}
          size="sm"
          className="bg-pink-400 hover:bg-pink-500 text-white rounded-xl w-full"
        >
          {saving === "invite"
            ? "Saving..."
            : success === "invite"
              ? "Saved ✓"
              : "Update Invite Code"}
        </Button>
      </div>

      <Button
        data-ocid="settings.logout_button"
        onClick={clear}
        variant="outline"
        className="w-full rounded-xl border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500 mt-2"
      >
        <LogOut size={16} className="mr-2" /> Sign Out
      </Button>
    </div>
  );
}
