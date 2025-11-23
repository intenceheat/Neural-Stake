// components/navigation/NavigationGlyph.tsx

"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { useNavigation } from "./NavigationProvider"

interface NavigationGlyphProps {
  id: "home" | "positions" | "markets" | "leaderboard"
  label: string
  icon: LucideIcon
  shape: "hexagon" | "triangle" | "square" | "circle"
}

const shapeVariants = {
  hexagon: {
    path: "M14 2.5L24 8.5V19.5L14 25.5L4 19.5V8.5L14 2.5Z",
    viewBox: "0 0 28 28",
  },
  triangle: {
    path: "M14 2L26 24H2L14 2Z",
    viewBox: "0 0 28 28",
  },
  square: {
    path: "M4 4H24V24H4V4Z",
    viewBox: "0 0 28 28",
  },
  circle: {
    path: "M14 2C7.4 2 2 7.4 2 14C2 20.6 7.4 26 14 26C20.6 26 26 20.6 26 14C26 7.4 20.6 2 14 2Z",
    viewBox: "0 0 28 28",
  },
}

export function NavigationGlyph({ id, label, icon: Icon, shape }: NavigationGlyphProps) {
  const { activeView, setActiveView } = useNavigation()
  const isActive = activeView === id
  const shapeData = shapeVariants[shape]

  return (
    <button
      onClick={() => setActiveView(id)}
      className="relative flex flex-col items-center gap-2 py-2 w-full group"
    >
      {/* Glyph container */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer rotating shape - SLOWER */}
        <motion.div
          className="absolute inset-0"
          animate={{
            rotate: isActive ? [0, 360] : [0, 180, 0],
          }}
          transition={{
            duration: isActive ? 20 : 30, // SLOWED DOWN
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox={shapeData.viewBox}
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
          >
            <motion.path
              d={shapeData.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={isActive ? "text-amber-500/60" : "text-cyan-400/40"}
              animate={{
                strokeWidth: [1.5, 2.5, 1.5],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>

        {/* Counter-rotating inner shape - SLOWER */}
        <motion.div
          className="absolute inset-2"
          animate={{
            rotate: isActive ? [0, -360] : [0, -180, 0],
          }}
          transition={{
            duration: isActive ? 15 : 25, // SLOWED DOWN
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox={shapeData.viewBox}
            className="w-full h-full"
            style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
          >
            <motion.path
              d={shapeData.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className={isActive ? "text-amber-500/80" : "text-cyan-400/60"}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </svg>
        </motion.div>

        {/* Pulsing background */}
        <motion.div
          className={`absolute inset-3 rounded-lg ${
            isActive ? "bg-amber-500/20" : "bg-cyan-400/10"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon */}
        <motion.div
          className={`relative z-10 transition-colors duration-300 ${
            isActive ? "text-amber-500" : "text-cyan-400/70 group-hover:text-cyan-400"
          }`}
          animate={
            isActive
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon size={26} strokeWidth={1.5} />
        </motion.div>

        {/* REMOVED: Active particles */}
        {/* REMOVED: Orbiting dot */}
      </div>

      {/* Label */}
      <motion.span
        className={`text-[9px] font-bold uppercase tracking-[0.15em] transition-colors ${
          isActive ? "text-amber-500" : "text-cyan-400/60 group-hover:text-cyan-400"
        }`}
        animate={
          isActive
            ? {
                opacity: [0.8, 1, 0.8],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {label}
      </motion.span>

      {/* Active underline */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </button>
  )
}