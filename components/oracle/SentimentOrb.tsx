"use client";

import { motion } from "framer-motion";

interface SentimentOrbProps {
  sentimentScore: number; // -1 to +1
  confidence: number; // 0 to 100
  volume?: number; // Total SOL staked
  timeRemaining?: number; // Seconds until deadline
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

export function SentimentOrb({
  sentimentScore,
  confidence,
  volume = 0,
  timeRemaining = 86400,
  size = "md",
  showLabel = true,
}: SentimentOrbProps) {
  // Size mapping
  const sizeMap = {
    sm: 64,
    md: 120,
    lg: 180,
    xl: 240,
  };

  const baseSize = sizeMap[size];
  
  // Calculate visual properties
  const orbSize = volume > 0 ? baseSize + Math.min(volume / 10, baseSize * 0.8) : baseSize;
  const opacity = 0.3 + (confidence / 100) * 0.7;
  
  // Pulse speed: faster as deadline approaches (max 2s, min 0.8s)
  const pulseDuration = Math.max(0.8, 2 - (1 - Math.min(timeRemaining / 86400, 1)));

  // Color based on sentiment
  const getColor = () => {
    if (sentimentScore > 0.3) return { from: "#10B981", to: "#059669", label: "BULLISH" };
    if (sentimentScore < -0.3) return { from: "#EF4444", to: "#DC2626", label: "BEARISH" };
    return { from: "#FBBF24", to: "#F59E0B", label: "NEUTRAL" };
  };

  const colors = getColor();
  const gradientId = `orbGradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative flex items-center justify-center"
        style={{ width: orbSize, height: orbSize }}
        animate={{
          scale: [1, 1.05, 1],
          filter: [
            `drop-shadow(0 0 ${orbSize / 10}px ${colors.from}80)`,
            `drop-shadow(0 0 ${orbSize / 5}px ${colors.from}CC)`,
            `drop-shadow(0 0 ${orbSize / 10}px ${colors.from}80)`,
          ],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Main SVG Orb */}
        <svg viewBox="0 0 200 200" className="absolute inset-0">
          <defs>
            <radialGradient id={gradientId}>
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </radialGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="80"
            fill={`url(#${gradientId})`}
            opacity={opacity}
          />
        </svg>

        {/* Inner glow pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.from}40 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: pulseDuration * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Sentiment score display */}
        {size !== "sm" && (
          <div className="relative z-10 text-center">
            <motion.div
              className={`font-orbitron font-black text-white ${
                size === "xl" ? "text-5xl" : size === "lg" ? "text-4xl" : "text-3xl"
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {Math.abs(sentimentScore * 100).toFixed(0)}%
            </motion.div>
            {showLabel && (
              <div className="text-xs text-white/70 uppercase tracking-wider font-orbitron">
                {colors.label}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Confidence indicator */}
      {showLabel && size !== "sm" && (
        <div className="text-xs text-slate-500 font-mono">
          {confidence}% confidence
        </div>
      )}
    </div>
  );
}