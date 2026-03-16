import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  {
    id: "rose",
    name: "Rose",
    description: "Soft pink & white",
    bg: "#fff5f7",
    particleColor: "249,168,212",
    gradient: "linear-gradient(135deg, #fff5f7 0%, #ffe4ef 100%)",
    preview: ["#f9a8d4", "#fbcfe8", "#fff5f7"],
    isDark: false,
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark starfield",
    bg: "#0f0f1a",
    particleColor: "180,180,255",
    gradient: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
    preview: ["#0f0f1a", "#1a1a2e", "#b4b4ff"],
    isDark: true,
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple dream",
    bg: "#f5f0ff",
    particleColor: "167,139,250",
    gradient: "linear-gradient(135deg, #f5f0ff 0%, #ede9fe 100%)",
    preview: ["#a78bfa", "#ddd6fe", "#f5f0ff"],
    isDark: false,
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm golden glow",
    bg: "#fff8f0",
    particleColor: "251,146,60",
    gradient: "linear-gradient(135deg, #fff8f0 0%, #fed7aa 100%)",
    preview: ["#fb923c", "#fdba74", "#fff8f0"],
    isDark: false,
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Calm blue waves",
    bg: "#f0f8ff",
    particleColor: "56,189,248",
    gradient: "linear-gradient(135deg, #f0f8ff 0%, #bae6fd 100%)",
    preview: ["#38bdf8", "#7dd3fc", "#f0f8ff"],
    isDark: false,
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Northern lights",
    bg: "#0a1628",
    particleColor: "52,211,153",
    gradient: "linear-gradient(135deg, #0a1628 0%, #0f2744 100%)",
    preview: ["#0a1628", "#34d399", "#6ee7b7"],
    isDark: true,
  },
];

export type Theme = (typeof THEMES)[number];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES[0],
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState(
    () => localStorage.getItem("twoverse-theme") || "rose",
  );

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  const setTheme = (id: string) => {
    setThemeId(id);
    localStorage.setItem("twoverse-theme", id);
  };

  useEffect(() => {
    document.body.style.background = theme.gradient;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
