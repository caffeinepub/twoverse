import { Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface Capsule {
  id: string;
  message: string;
  unlockDate: string;
  createdAt: string;
  author: string;
}

const STORAGE_KEY = "twoverse_time_capsules";

function getCapsules(): Capsule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCapsules(capsules: Capsule[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

export function TimeCapsulePage() {
  const [capsules, setCapsules] = useState<Capsule[]>(getCapsules);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const isUnlocked = (c: Capsule) => c.unlockDate <= today;

  const handleCreate = () => {
    if (!message.trim()) {
      setError("Message is required.");
      return;
    }
    if (!unlockDate) {
      setError("Unlock date is required.");
      return;
    }
    if (unlockDate <= today) {
      setError("Unlock date must be in the future.");
      return;
    }
    setError("");
    const newCapsule: Capsule = {
      id: Date.now().toString(),
      message: message.trim(),
      unlockDate,
      createdAt: today,
      author: author.trim() || "Someone special",
    };
    const updated = [newCapsule, ...capsules];
    setCapsules(updated);
    saveCapsules(updated);
    setMessage("");
    setUnlockDate("");
    setAuthor("");
    setOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = capsules.filter((c) => c.id !== id);
    setCapsules(updated);
    saveCapsules(updated);
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto flex flex-col gap-5">
      <div className="flex justify-between items-center">
        <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest">
          {capsules.length} capsule{capsules.length !== 1 ? "s" : ""}
        </p>
        <Button
          data-ocid="capsule.add_button"
          onClick={() => setOpen(true)}
          size="sm"
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl gap-1"
        >
          <Plus size={15} /> New Capsule
        </Button>
      </div>

      {/* Intro */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100 text-center">
        <div className="text-3xl mb-2">⏳</div>
        <p className="text-sm text-teal-700 font-serif italic">
          "Seal your feelings in time. Open them when the moment arrives."
        </p>
      </div>

      {capsules.length === 0 ? (
        <div
          data-ocid="capsule.empty_state"
          className="text-center py-10 text-muted-foreground"
        >
          <Lock size={36} className="mx-auto mb-3 text-teal-200" />
          <p className="text-sm">No capsules yet. Create your first one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {capsules.map((c, i) => {
            const unlocked = isUnlocked(c);
            return (
              <div
                key={c.id}
                data-ocid={`capsule.item.${i + 1}`}
                className={`rounded-2xl p-4 border shadow-soft ${
                  unlocked
                    ? "bg-white border-green-200"
                    : "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      unlocked ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {unlocked ? (
                      <LockOpen size={18} className="text-green-500" />
                    ) : (
                      <Lock size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground">
                          From: {c.author}
                        </span>
                        {unlocked ? (
                          <p className="text-sm text-foreground mt-1 leading-relaxed">
                            {c.message}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1 blur-[3px] select-none">
                            {c.message}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        data-ocid={`capsule.delete_button.${i + 1}`}
                        onClick={() => handleDelete(c.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors ml-2"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-muted-foreground">
                        Created: {c.createdAt}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          unlocked ? "text-green-500" : "text-teal-500"
                        }`}
                      >
                        {unlocked ? "🔓 Unlocked" : `🔒 Opens ${c.unlockDate}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="capsule.dialog"
          className="rounded-2xl border-teal-100 max-w-sm mx-auto bg-white text-gray-800"
        >
          <DialogHeader>
            <DialogTitle className="font-serif">New Time Capsule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-xs text-gray-500">From (your name)</Label>
              <Input
                data-ocid="capsule.author_input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Yuva"
                className="mt-1 rounded-xl border-teal-200"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Your message</Label>
              <Textarea
                data-ocid="capsule.message_textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something from the heart..."
                className="mt-1 rounded-xl border-teal-200 resize-none"
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Unlock date</Label>
              <Input
                type="date"
                data-ocid="capsule.unlock_date_input"
                value={unlockDate}
                min={today}
                onChange={(e) => setUnlockDate(e.target.value)}
                className="mt-1 rounded-xl border-teal-200"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button
              data-ocid="capsule.submit_button"
              onClick={handleCreate}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
            >
              Seal Capsule 🔒
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
