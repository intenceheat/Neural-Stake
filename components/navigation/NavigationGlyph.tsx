"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { useNavigation } from "./NavigationProvider"

interface NavigationGlyphProps {
  id: "home" | "positions" | "markets" | "leaderboard"
  label: string
  icon: LucideIcon
  layout?: "vertical" | "horizontal"
}

export function NavigationGlyph({ id, label, icon: Icon, layout = "vertical" }: NavigationGlyphProps) {
  const { activeView, setActiveView } = useNavigation()
  const isActive = activeView === id

  return (
    <button
      onClick={() => setActiveView(id)}
      className={`
        relative flex items-center gap-3 p-3 rounded-lg
        transition-all duration-300 group
        ${layout === "horizontal" ? "flex-col min-w-[80px]" : "flex-row w-full"}
        ${isActive ? "bg-amber-500/10" : "hover:bg-white/5"}
      `}
    >
      {/* Glyph container */}
      <div className={`
        relative flex items-center justify-center
        ${layout === "horizontal" ? "w-12 h-12" : "w-10 h-10"}
      `}>
        {/* Active glow */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-amber-500/20 blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Icon */}
        <div className={`
          relative z-10 transition-colors duration-300
          ${isActive ? "text-amber-500" : "text-cyan-400/60 group-hover:text-cyan-400"}
        `}>
          <Icon size={layout === "horizontal" ? 24 : 20} strokeWidth={1.5} />
        </div>

        {/* Border glow */}
        <motion.div
          className={`
            absolute inset-0 rounded-lg border
            ${isActive ? "border-amber-500/50" : "border-cyan-400/20"}
          `}
          animate={isActive ? {
            boxShadow: [
              "0 0 0px rgba(245, 158, 11, 0)",
              "0 0 20px rgba(245, 158, 11, 0.3)",
              "0 0 0px rgba(245, 158, 11, 0)",
            ],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Label */}
      <span className={`
        text-xs font-medium uppercase tracking-wider transition-colors
        ${isActive ? "text-amber-500" : "text-cyan-400/60 group-hover:text-cyan-400"}
        ${layout === "horizontal" ? "text-center" : ""}
      `}>
        {label}
      </span>

      {/* Active indicator line */}
      {isActive && layout === "vertical" && (
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full"
          layoutId="activeIndicator"
        />
      )}

      {isActive && layout === "horizontal" && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 bg-amber-500 rounded-t-full"
          layoutId="activeIndicatorMobile"
        />
      )}
    </button>
  )
}