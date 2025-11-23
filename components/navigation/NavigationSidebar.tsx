// components/navigation/NavigationSidebar.tsx

"use client"

import { Eye, Wallet, Grid3x3, Trophy, Hexagon, Triangle, Square, Circle } from "lucide-react"
import { NavigationGlyph } from "./NavigationGlyph"
import { motion } from "framer-motion"

const glyphs = [
  { id: "home" as const, label: "Oracle", icon: Eye, shape: "hexagon" as const },
  { id: "positions" as const, label: "Stakes", icon: Wallet, shape: "triangle" as const },
  { id: "markets" as const, label: "Markets", icon: Grid3x3, shape: "square" as const },
  { id: "leaderboard" as const, label: "Leaders", icon: Trophy, shape: "circle" as const },
]

export function NavigationSidebar() {
  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-[120px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border-r border-cyan-400/30 z-50 shadow-2xl shadow-cyan-500/10"
      initial={{ x: -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 0%, rgba(34, 211, 238, 0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Navigation glyphs - starts at top */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-8 pt-8 relative z-10">
          {glyphs.map((glyph, index) => (
            <motion.div
              key={glyph.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <NavigationGlyph
                id={glyph.id}
                label={glyph.label}
                icon={glyph.icon}
                shape={glyph.shape}
              />
            </motion.div>
          ))}
        </nav>

        {/* Bottom animated indicator */}
        <div className="py-6 flex flex-col items-center gap-2 border-t border-cyan-400/20">
          <motion.div
            className="w-1 h-12 bg-gradient-to-b from-cyan-400 via-amber-500 to-transparent rounded-full"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </motion.aside>
  )
}