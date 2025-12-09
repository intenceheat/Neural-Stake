// components/navigation/NavigationProvider.tsx

"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type ViewType = "home" | "positions" | "markets" | "leaderboard" | "intel"  // ← ADD "intel"

interface NavigationContextType {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<ViewType>("home")

  return (
    <NavigationContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}