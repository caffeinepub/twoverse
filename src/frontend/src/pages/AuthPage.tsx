import { Heart } from "lucide-react";
import { useState } from "react";
import { ParticleCanvas } from "../components/ParticleCanvas";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthPageProps {
  defaultTab?: "login" | "register";
  sessionExpired?: boolean;
}

export function AuthPage({
  defaultTab = "login",
  sessionExpired = false,
}: AuthPageProps) {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const { actor } = useActor();
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    if (!actor) {
      setError("Please sign in with Internet Identity first.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!inviteCode.trim()) {
      setError("Please enter the invite code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await actor.registerWithInviteCode(inviteCode.trim(), {
        name: name.trim(),
      });
      setSuccess(true);
      // Reload to re-check registration
      setTimeout(() => window.location.reload(), 1200);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Registration failed.";
      // Make common backend error messages friendlier
      if (msg.includes("Invalid invite code") || msg.includes("invite")) {
        setError(
          "That invite code isn't valid. Please double-check and try again.",
        );
      } else if (msg.includes("already registered")) {
        setError("This account is already registered. Try signing in.");
      } else if (msg.includes("full") || msg.includes("limit")) {
        setError("This TwoVerse is full — only 3 members allowed.");
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

        {sessionExpired && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center">
            Your session data was reset. Please re-join with your invite code to
            restore access.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
          <div className="flex rounded-xl bg-pink-50 p-1 mb-6">
            <button
              type="button"
              data-ocid="auth.login.tab"
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === "login"
                  ? "bg-white text-pink-500 shadow-sm"
                  : "text-gray-400"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              data-ocid="auth.register.tab"
              onClick={() => {
                setTab("register");
                setError("");
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === "register"
                  ? "bg-white text-pink-500 shadow-sm"
                  : "text-gray-400"
              }`}
            >
              Join
            </button>
          </div>

          {tab === "login" ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 text-center">
                Sign in with your Internet Identity to continue.
              </p>
              <Button
                data-ocid="auth.login_button"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
              >
                {isLoggingIn
                  ? "Signing in..."
                  : "Sign in with Internet Identity"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {!identity && (
                <div className="rounded-xl bg-pink-50 border border-pink-100 px-3 py-2 text-xs text-pink-600 text-center">
                  Sign in with Internet Identity first, then fill in your
                  details below.
                </div>
              )}
              <div>
                <Label htmlFor="reg-name" className="text-xs text-gray-500">
                  Your Name
                </Label>
                <Input
                  id="reg-name"
                  data-ocid="auth.name_input"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 rounded-xl border-pink-200"
                />
              </div>
              <div>
                <Label htmlFor="invite" className="text-xs text-gray-500">
                  Invite Code
                </Label>
                <Input
                  id="invite"
                  data-ocid="auth.invite_code_input"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="mt-1 rounded-xl border-pink-200"
                />
              </div>
              {error && (
                <p
                  data-ocid="auth.error_state"
                  className="text-xs text-red-500"
                >
                  {error}
                </p>
              )}
              {success && (
                <p
                  data-ocid="auth.success_state"
                  className="text-xs text-green-600 text-center"
                >
                  ✓ Joined! Loading your world…
                </p>
              )}
              <Button
                data-ocid="auth.register_button"
                onClick={handleRegister}
                disabled={loading || success}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
              >
                {loading
                  ? "Joining..."
                  : success
                    ? "Welcome! ✨"
                    : "Join TwoVerse"}
              </Button>
              {!identity && (
                <Button
                  variant="ghost"
                  data-ocid="auth.identity_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="w-full text-pink-400 hover:text-pink-500"
                >
                  {isLoggingIn ? "Opening..." : "Open Internet Identity"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
