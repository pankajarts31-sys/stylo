"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ClientThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        display: "flex",
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: "50px",
        padding: "0.25rem",
        position: "relative",
      }}
    >
      <button
        onClick={() => setTheme("women")}
        style={{
          padding: "0.3rem 0.8rem",
          borderRadius: "50px",
          border: "none",
          background: theme === "women" ? "var(--btn-gradient)" : "transparent",
          color: theme === "women" ? "var(--btn-text)" : "var(--fg-secondary)",
          fontWeight: theme === "women" ? 600 : 500,
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.3s ease",
          zIndex: 1,
        }}
      >
        Women
      </button>
      <button
        onClick={() => setTheme("men")}
        style={{
          padding: "0.3rem 0.8rem",
          borderRadius: "50px",
          border: "none",
          background: theme === "men" ? "var(--btn-gradient)" : "transparent",
          color: theme === "men" ? "var(--btn-text)" : "var(--fg-secondary)",
          fontWeight: theme === "men" ? 600 : 500,
          fontSize: "0.85rem",
          cursor: "pointer",
          transition: "all 0.3s ease",
          zIndex: 1,
        }}
      >
        Men
      </button>
    </div>
  );
}
