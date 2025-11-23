"use client"

import { Eye, Wallet, Grid3x3, Trophy, Settings } from "lucide-react"
import { NavigationGlyph } from "./NavigationGlyph"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

const glyphs = [
  { id: "home" as const, label: "Oracle", icon: Eye },
  { id: "positions" as const, label: "Positions", icon: Wallet },
  { id: "markets" as const, label: "Markets", icon: Grid3x3 },
  { id: "leaderboard" as const, label: "Leaders", icon: Trophy },
]

export function NavigationSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-slate-950/50 backdrop-blur-xl border-r border-cyan-400/10 z-50"
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Eye size={18} className="text-slate-950" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  Oracle
                </span>
                <span className="text-xs text-cyan-400/50">Protocol</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation glyphs */}
        <nav className="flex-1 space-y-2">
          {glyphs.map((glyph) => (
            <NavigationGlyph
              key={glyph.id}
              id={glyph.id}
              label={isCollapsed ? "" : glyph.label}
              icon={glyph.icon}
              layout="vertical"
            />
          ))}
        </nav>

        {/* Settings at bottom */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <Settings size={20} className="text-cyan-400/60 group-hover:text-cyan-400" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xs text-cyan-400/60 group-hover:text-cyan-400 uppercase tracking-wider"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}