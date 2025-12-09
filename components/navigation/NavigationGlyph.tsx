"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { useNavigation } from "./NavigationProvider"

interface NavigationGlyphProps {
  id: "home" | "positions" | "markets" | "leaderboard" | "neural"
  label: string
  icon: LucideIcon
  shape: "hexagon" | "triangle" | "square" | "circle" | "diamond" | "octagon"
  waterColor: string
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
  diamond: {
    path: "M14 2L26 14L14 26L2 14L14 2Z",
    viewBox: "0 0 28 28",
  },
  octagon: {
    path: "M10 2L18 2L26 10L26 18L18 26L10 26L2 18L2 10L10 2Z",
    viewBox: "0 0 28 28",
  },
}

export function NavigationGlyph({ id, label, icon: Icon, shape, waterColor }: NavigationGlyphProps) {
  const { activeView, setActiveView } = useNavigation()
  const isActive = activeView === id
  const shapeData = shapeVariants[shape]

  return (
    <button
      onClick={() => setActiveView(id)}
      className="relative flex flex-col items-center gap-1 md:gap-2 py-1 md:py-2 w-full group"
    >
      {/* Glyph container - MOBILE RESPONSIVE */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
        {/* Outer rotating shape */}
        <motion.div
          className="absolute inset-0"
          animate={{
            rotate: isActive ? [0, 360] : [0, 180, 0],
          }}
          transition={{
            duration: isActive ? 25 : 35,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox={shapeData.viewBox}
            className="w-full h-full"
            style={{ 
              filter: `drop-shadow(0 0 8px ${waterColor}30)`,
            }}
          >
            <motion.path
              d={shapeData.path}
              fill="none"
              stroke={waterColor}
              strokeWidth="1.2"
              opacity={isActive ? 0.7 : 0.4}
              animate={{
                strokeWidth: [1.2, 2, 1.2],
                opacity: isActive ? [0.7, 0.9, 0.7] : [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>

        {/* Counter-rotating inner shape */}
        <motion.div
          className="absolute inset-1.5 md:inset-2"
          animate={{
            rotate: isActive ? [0, -360] : [0, -180, 0],
          }}
          transition={{
            duration: isActive ? 20 : 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            viewBox={shapeData.viewBox}
            className="w-full h-full"
            style={{ 
              filter: `drop-shadow(0 0 6px ${waterColor}40)`,
            }}
          >
            <motion.path
              d={shapeData.path}
              fill="none"
              stroke={waterColor}
              strokeWidth="1"
              opacity={isActive ? 0.85 : 0.55}
              animate={{
                scale: [1, 1.08, 1],
                opacity: isActive ? [0.85, 1, 0.85] : [0.55, 0.75, 0.55],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </svg>
        </motion.div>

        {/* Watercolor wash background */}
        <motion.div
          className="absolute inset-2 md:inset-3 rounded-lg"
          style={{
            backgroundColor: `${waterColor}15`,
            boxShadow: `inset 0 0 15px ${waterColor}20`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: isActive ? [0.4, 0.65, 0.4] : [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon - MOBILE RESPONSIVE */}
        <motion.div
          className="relative z-10 transition-colors duration-500"
          style={{
            color: isActive ? waterColor : `${waterColor}90`,
          }}
          animate={
            isActive
              ? {
                  scale: [1, 1.12, 1],
                  rotate: [0, 3, -3, 0],
                }
              : {}
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-5 h-5 md:w-[26px] md:h-[26px]" strokeWidth={1.4} />
        </motion.div>
      </div>

      {/* Label - MOBILE RESPONSIVE */}
      <motion.span
        className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.12em] md:tracking-[0.15em] transition-colors duration-500"
        style={{
          color: isActive ? waterColor : `${waterColor}80`,
        }}
        animate={
          isActive
            ? {
                opacity: [0.85, 1, 0.85],
              }
            : {}
        }
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {label}
      </motion.span>

      {/* Active underline - MOBILE RESPONSIVE */}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-1/2 w-6 md:w-8 h-0.5"
          style={{
            background: `linear-gradient(to right, transparent, ${waterColor}, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </button>
  )
}