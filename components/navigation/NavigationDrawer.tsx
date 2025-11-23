// components/navigation/NavigationDrawer.tsx

"use client"

import { Eye, Wallet, Grid3x3, Trophy } from "lucide-react"
import { NavigationGlyph } from "./NavigationGlyph"
import { motion } from "framer-motion"

const glyphs = [
  { id: "home" as const, label: "Oracle", icon: Eye, shape: "hexagon" as const },
  { id: "positions" as const, label: "Stakes", icon: Wallet, shape: "triangle" as const },
  { id: "markets" as const, label: "Markets", icon: Grid3x3, shape: "square" as const },
  { id: "leaderboard" as const, label: "Leaders", icon: Trophy, shape: "circle" as const },
]

export function NavigationDrawer() {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-cyan-400/20 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {glyphs.map((glyph) => (
          <NavigationGlyph
            key={glyph.id}
            id={glyph.id}
            label={glyph.label}
            icon={glyph.icon}
            shape={glyph.shape}
          />
        ))}
      </div>
    </motion.div>
  )
}