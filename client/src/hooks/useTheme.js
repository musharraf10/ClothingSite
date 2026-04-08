import { useEffect, useState } from "react";

const STORAGE_KEY = "madvira_theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function getInitialTheme() {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(STORAGE_KEY) || "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { theme, setTheme, toggleTheme };
}

