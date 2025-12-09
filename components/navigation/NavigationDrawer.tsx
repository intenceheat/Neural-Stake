// components/navigation/NavigationDrawer.tsx

"use client"

import { Crown } from "lucide-react"
import { NexusIcon, StakesIcon, MarketsIcon, IntelIcon } from "./CustomGlyphIcons"
import { NavigationGlyph } from "./NavigationGlyph"
import { motion } from "framer-motion"

const glyphs = [
  { id: "home" as const, label: "Nexus", icon: NexusIcon, shape: "octagon" as const, waterColor: "#0f766e" },
  { id: "positions" as const, label: "Stakes", icon: StakesIcon, shape: "triangle" as const, waterColor: "#c084fc" },
  { id: "markets" as const, label: "Markets", icon: MarketsIcon, shape: "square" as const, waterColor: "#6ee7b7" },
  { id: "leaderboard" as const, label: "Rankings", icon: Crown, shape: "circle" as const, waterColor: "#e879f9" },
  { id: "neural" as const, label: "Neural", icon: IntelIcon, shape: "hexagon" as const, waterColor: "#06b6d4" },
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
            waterColor={glyph.waterColor}
          />
        ))}
      </div>
    </motion.div>
  )
}