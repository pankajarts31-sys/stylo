"use client";

import { AuthProvider } from "@/context/AuthContext";
import { GenderProvider } from "@/context/GenderContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GenderProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </GenderProvider>
    </AuthProvider>
  );
}
