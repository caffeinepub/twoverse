import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { ParticleCanvas } from "./components/ParticleCanvas";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AnniversaryPage } from "./pages/AnniversaryPage";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MissionsPage } from "./pages/MissionsPage";
import { MorePage } from "./pages/MorePage";
import { PromptsPage } from "./pages/PromptsPage";
import { QuizPage } from "./pages/QuizPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TimeCapsulePage } from "./pages/TimeCapsulePage";
import { VaultPage } from "./pages/VaultPage";

function PageLayout({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme.isDark;

  return (
    <div className="min-h-screen pb-16" style={{ background: theme.gradient }}>
      <ParticleCanvas particleColor={theme.particleColor} />
      <div className="relative z-10">
        <div
          className="sticky top-0 backdrop-blur-sm border-b z-20"
          style={{
            background: isDark ? "rgba(15,15,26,0.8)" : "rgba(255,255,255,0.8)",
            borderColor: isDark ? "rgba(180,180,255,0.15)" : "rgb(252,231,243)",
          }}
        >
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-center">
            <h1
              className="text-base font-semibold flex items-center gap-2 font-serif"
              style={{ color: isDark ? "#e2e8f0" : undefined }}
            >
              <Heart
                size={14}
                style={{ color: isDark ? "#b4b4ff" : undefined }}
                className={isDark ? "" : "text-pink-400"}
                fill="currentColor"
              />
              {title}
            </h1>
          </div>
        </div>
        <div className="page-enter">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}

const rootRoute = createRootRoute();

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <PageLayout title="TwoVerse">
      <DashboardPage />
    </PageLayout>
  ),
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => (
    <PageLayout title="Chat">
      <ChatPage />
    </PageLayout>
  ),
});

const vaultRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vault",
  component: () => (
    <PageLayout title="Memories">
      <VaultPage />
    </PageLayout>
  ),
});

const promptsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/prompts",
  component: () => (
    <PageLayout title="Check-in">
      <PromptsPage />
    </PageLayout>
  ),
});

const moreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/more",
  component: () => (
    <PageLayout title="More">
      <MorePage />
    </PageLayout>
  ),
});

const missionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/missions",
  component: () => (
    <PageLayout title="Missions">
      <MissionsPage />
    </PageLayout>
  ),
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: () => (
    <PageLayout title="Bond Analytics">
      <AnalyticsPage />
    </PageLayout>
  ),
});

const anniversaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/anniversary",
  component: () => (
    <PageLayout title="Anniversary">
      <AnniversaryPage />
    </PageLayout>
  ),
});

const timeCapsuleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/time-capsule",
  component: () => (
    <PageLayout title="Time Capsule">
      <TimeCapsulePage />
    </PageLayout>
  ),
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/quiz",
  component: () => (
    <PageLayout title="Compatibility Quiz">
      <QuizPage />
    </PageLayout>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <PageLayout title="Settings">
      <SettingsPage />
    </PageLayout>
  ),
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  chatRoute,
  vaultRoute,
  promptsRoute,
  moreRoute,
  missionsRoute,
  analyticsRoute,
  anniversaryRoute,
  timeCapsuleRoute,
  quizRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AuthenticatedApp() {
  return <RouterProvider router={router} />;
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <ParticleCanvas />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Heart
          className="text-pink-400 animate-pulse"
          size={32}
          fill="currentColor"
        />
        <p className="text-sm text-muted-foreground font-serif italic">
          {message}
        </p>
      </div>
    </div>
  );
}

function RegistrationGate() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [registrationChecked, setRegistrationChecked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!actor || isFetching || !identity) return;

    let cancelled = false;
    (async () => {
      try {
        const profile = await actor.getCallerUserProfile();
        if (!cancelled) {
          setIsRegistered(profile !== null);
          setRegistrationChecked(true);
        }
      } catch {
        if (!cancelled) {
          // Backend trap = user not registered
          setIsRegistered(false);
          setRegistrationChecked(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching, identity]);

  if (!registrationChecked) {
    return <LoadingScreen message="Checking your account..." />;
  }

  if (!isRegistered) {
    return <AuthPage defaultTab="register" sessionExpired />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <ThemeProvider>
        <LoadingScreen message="Loading your world..." />
      </ThemeProvider>
    );
  }

  if (!identity) {
    return (
      <ThemeProvider>
        <AuthPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <RegistrationGate />
    </ThemeProvider>
  );
}
