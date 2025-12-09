// components/navigation/NavigationSidebar.tsx

"use client"

import { Crown } from "lucide-react";
import { NexusIcon, StakesIcon, MarketsIcon, IntelIcon } from "./CustomGlyphIcons";
import { NavigationGlyph } from "./NavigationGlyph";
import { motion } from "framer-motion";

const glyphs = [
  { id: "home" as const, label: "Nexus", icon: NexusIcon, shape: "octagon" as const, waterColor: "#0f766e" },
  { id: "positions" as const, label: "Stakes", icon: StakesIcon, shape: "triangle" as const, waterColor: "#c084fc" },
  { id: "markets" as const, label: "Markets", icon: MarketsIcon, shape: "square" as const, waterColor: "#6ee7b7" },
  { id: "leaderboard" as const, label: "Rankings", icon: Crown, shape: "circle" as const, waterColor: "#e879f9" },
  { id: "neural" as const, label: "Neural", icon: IntelIcon, shape: "hexagon" as const, waterColor: "#06b6d4" },
]

export function NavigationSidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:block fixed left-0 top-0 h-screen w-[120px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border-r border-slate-800/60 z-50 shadow-2xl shadow-slate-950/50"
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 50% 0%, rgba(15, 118, 110, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 100%, rgba(110, 231, 183, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 0%, rgba(15, 118, 110, 0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Navigation glyphs */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-6 pt-8 relative z-10">
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
                  waterColor={glyph.waterColor}
                />
              </motion.div>
            ))}
          </nav>

          {/* Bottom animated indicator */}
          <div className="py-6 flex flex-col items-center gap-2 border-t border-slate-800/40">
            <motion.div
              className="w-1 h-12 rounded-full"
              style={{
                background: "linear-gradient(to bottom, #0f766e, #c084fc, #6ee7b7, transparent)",
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scaleY: [1, 1.15, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <motion.nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950 backdrop-blur-2xl border-t border-slate-800/60 z-50 shadow-2xl shadow-slate-950/50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="relative h-full overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                "radial-gradient(circle at 0% 50%, rgba(15, 118, 110, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 50%, rgba(110, 231, 183, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 50%, rgba(15, 118, 110, 0.1) 0%, transparent 50%)",
              ],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Navigation glyphs */}
          <div className="flex items-center justify-around h-full px-2 relative z-10">
            {glyphs.map((glyph, index) => (
              <motion.div
                key={glyph.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="flex-1"
              >
                <NavigationGlyph
                  id={glyph.id}
                  label={glyph.label}
                  icon={glyph.icon}
                  shape={glyph.shape}
                  waterColor={glyph.waterColor}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.nav>
    </>
  )
}