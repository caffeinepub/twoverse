import { Heart } from "lucide-react";
import { useState } from "react";
import { ParticleCanvas } from "../components/ParticleCanvas";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useLocalAuth } from "../contexts/LocalAuthContext";
import { useActor } from "../hooks/useActor";

const PASSKEY = "3275";

export function AuthPage() {
  const { setAuth } = useLocalAuth();
  const { actor } = useActor();
  const [name, setName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async () => {
    if (!actor) {
      setError("App is loading, please try again.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (passkey !== PASSKEY) {
      setError("Wrong passkey. Please try again.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let sessionId = localStorage.getItem("tv_session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
      }
      await actor.registerUser(sessionId, name.trim(), passkey);
      setSuccess(true);
      setAuth(sessionId, name.trim());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed.";
      if (msg.includes("full") || msg.includes("max")) {
        setError("This TwoVerse is full — only 3 members allowed.");
      } else if (msg.includes("passkey") || msg.includes("Wrong")) {
        setError("Wrong passkey. Please try again.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative">
      <ParticleCanvas />
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-50 mb-4">
            <Heart className="text-pink-400" size={28} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-800 tracking-tight">
            TwoVerse
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Your private little world
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="auth-name" className="text-xs text-gray-500">
                Your Name
              </Label>
              <Input
                id="auth-name"
                data-ocid="auth.name_input"
                placeholder="e.g. Yuva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="mt-1 rounded-xl border-pink-200"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="auth-passkey" className="text-xs text-gray-500">
                Passkey
              </Label>
              <Input
                id="auth-passkey"
                data-ocid="auth.passkey_input"
                type="password"
                placeholder="Enter passkey"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="mt-1 rounded-xl border-pink-200"
                autoComplete="off"
              />
            </div>
            {error && (
              <p data-ocid="auth.error_state" className="text-xs text-red-500">
                {error}
              </p>
            )}
            {success && (
              <p
                data-ocid="auth.success_state"
                className="text-xs text-green-600 text-center"
              >
                Welcome! Loading your world...
              </p>
            )}
            <Button
              data-ocid="auth.login_button"
              onClick={handleLogin}
              disabled={loading || success}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
            >
              {loading
                ? "Entering..."
                : success
                  ? "Welcome! "
                  : "Enter TwoVerse"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
