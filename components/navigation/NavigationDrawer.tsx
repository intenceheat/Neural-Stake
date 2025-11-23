"use client"

import { Eye, Wallet, Grid3x3, Trophy } from "lucide-react"
import { NavigationGlyph } from "./NavigationGlyph"
import { motion } from "framer-motion"

const glyphs = [
  { id: "home" as const, label: "Oracle", icon: Eye },
  { id: "positions" as const, label: "Stakes", icon: Wallet },
  { id: "markets" as const, label: "Markets", icon: Grid3x3 },
  { id: "leaderboard" as const, label: "Leaders", icon: Trophy },
]

export function NavigationDrawer() {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-cyan-400/10 z-50 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around p-2 overflow-x-auto">
        {glyphs.map((glyph) => (
          <NavigationGlyph
            key={glyph.id}
            id={glyph.id}
            label={glyph.label}
            icon={glyph.icon}
            layout="horizontal"
          />
        ))}
      </div>
    </motion.div>
  )
}