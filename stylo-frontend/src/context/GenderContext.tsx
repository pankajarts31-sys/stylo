"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Gender = "men" | "women";

interface GenderContextValue {
  gender: Gender;
  setGender: (g: Gender) => void;
  /** Prefix to add to search queries, e.g. "men's " or "women's " */
  queryPrefix: string;
}

const GenderContext = createContext<GenderContextValue>({
  gender: "women",
  setGender: () => {},
  queryPrefix: "women's ",
});

export function GenderProvider({ children }: { children: ReactNode }) {
  const [gender, setGenderState] = useState<Gender>("women");

  const setGender = useCallback((g: Gender) => {
    setGenderState(g);
  }, []);

  const queryPrefix = gender === "men" ? "men's " : "women's ";

  return (
    <GenderContext.Provider value={{ gender, setGender, queryPrefix }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  return useContext(GenderContext);
}
