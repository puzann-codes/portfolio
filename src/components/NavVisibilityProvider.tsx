"use client";

import { createContext, useContext, useState } from "react";

// NavBar lives in the root layout (mounted on every route), but only the
// home page's intro screen needs to hide it — a tiny context lets that one
// page reach up and toggle it without NavBar needing route-specific logic.
const NavVisibilityContext = createContext<{
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
} | null>(null);

export function NavVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  return (
    <NavVisibilityContext.Provider value={{ hidden, setHidden }}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export function useNavVisibility() {
  const ctx = useContext(NavVisibilityContext);
  if (!ctx) {
    throw new Error("useNavVisibility must be used within NavVisibilityProvider");
  }
  return ctx;
}
