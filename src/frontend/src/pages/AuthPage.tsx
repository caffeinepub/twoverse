import { Heart } from "lucide-react";
import { useState } from "react";
import { ParticleCanvas } from "../components/ParticleCanvas";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AuthPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!actor) return;
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Registration failed.");
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
          <div className="flex rounded-xl bg-pink-50 p-1 mb-6">
            <button
              type="button"
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
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button
                data-ocid="auth.register_button"
                onClick={handleRegister}
                disabled={loading || isLoggingIn}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-xl"
              >
                {loading ? "Joining..." : "Join TwoVerse"}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                You'll need to sign in with Internet Identity first.
              </p>
              <Button
                variant="ghost"
                onClick={login}
                disabled={isLoggingIn}
                className="w-full text-pink-400 hover:text-pink-500"
              >
                {isLoggingIn ? "Opening..." : "Open Internet Identity"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
