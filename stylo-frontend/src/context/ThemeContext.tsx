"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

type ThemeMode = "men" | "women";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("women"); // Default to women's fashion
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth(); // Hook directly into AuthContext to check login status

  // Initial load
  useEffect(() => {
    // 1. Prioritize user from DB if logged in
    if (user && user.theme_preference) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(user.theme_preference);
      localStorage.setItem("stylo_theme", user.theme_preference);
    } 
    // 2. Otherwise fall back to local storage
    else {
      const savedTheme = localStorage.getItem("stylo_theme") as ThemeMode | null;
      if (savedTheme === "men" || savedTheme === "women") {
        setThemeState(savedTheme);
      }
    }
    setMounted(true);
  }, [user]); // Re-run when user auth state changes (e.g. they log in)

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem("stylo_theme", newTheme);
    
    // Sync to PostgreSQL if user is logged in
    if (user) {
      const token = localStorage.getItem("stylo_jwt");
      if (token) {
        try {
          await fetch(`${API}/api/auth/theme`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ theme_preference: newTheme })
          });
        } catch (e) {
          console.error("Failed to sync theme preference", e);
        }
      }
    }
  };

  // Prevent hydration mismatch by not rendering until client-side mounting is complete
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* Apply a global CSS class to the body based on the theme */}
      <div className={`theme-${theme} min-h-screen transition-colors duration-500`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
