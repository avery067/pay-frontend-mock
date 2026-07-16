import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "wise" | "mercury" | "revolut" | "stripe";
export const THEMES: Theme[] = ["wise", "mercury", "revolut", "stripe"];

type ThemeContextValue = {
  theme: Theme;
  dark: boolean;
  setTheme: (t: Theme) => void;
  toggleDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "wise",
  );
  const [dark, setDark] = useState<boolean>(
    () => localStorage.getItem("dark") === "true",
  );

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", theme);
    el.classList.toggle("dark", dark);
    localStorage.setItem("theme", theme);
    localStorage.setItem("dark", String(dark));
  }, [theme, dark]);

  return (
    <ThemeContext.Provider
      value={{ theme, dark, setTheme, toggleDark: () => setDark((d) => !d) }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
