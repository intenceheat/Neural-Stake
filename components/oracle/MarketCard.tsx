"use client";

import { motion } from "framer-motion";
import { SentimentOrb } from "./SentimentOrb";
import { Clock, TrendingUp, Users, CheckCircle } from "lucide-react";

interface MarketCardProps {
  marketId: string;
  question: string;
  oddsYes: number;
  oddsNo: number;
  sentiment: number;
  confidence: number;
  volume: number;
  participants: number;
  timeRemaining: string;
  onClick?: () => void;
  isResolved?: boolean;
  winningOutcome?: "YES" | "NO" | null;
}

export function MarketCard({
  marketId,
  question,
  oddsYes,
  oddsNo,
  sentiment,
  confidence,
  volume,
  participants,
  timeRemaining,
  onClick,
  isResolved = false,
  winningOutcome = null,
}: MarketCardProps) {
  return (
    <motion.div
      className={`group relative bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-hidden ${
        isResolved ? "cursor-default opacity-90" : "cursor-pointer"
      }`}
      whileHover={!isResolved ? {
        scale: 1.02,
        boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
      } : {}}
      whileTap={!isResolved ? { scale: 0.98 } : {}}
      onClick={isResolved ? undefined : onClick}
      transition={{ duration: 0.2 }}
    >
      {/* Hover glow effect (disabled if resolved) */}
      {!isResolved && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-300" />
      )}

      <div className="relative flex items-start gap-4">
        {/* Sentiment Orb */}
        <div className="flex-shrink-0">
          <SentimentOrb
            sentimentScore={sentiment}
            confidence={confidence}
            volume={volume}
            size="sm"
            showLabel={false}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Question */}
          <h3 className={`text-lg font-bold text-white mb-2 line-clamp-2 transition-colors ${
            !isResolved && "group-hover:text-amber-400"
          }`}>
            {question}
          </h3>

          {/* Resolved Badge - MOVED HERE, NO OVERLAP */}
          {isResolved && winningOutcome && (
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">
                RESOLVED: {winningOutcome}
              </span>
            </div>
          )}

          {/* Odds Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className={`font-bold ${
                isResolved && winningOutcome === "YES" 
                  ? "text-emerald-400" 
                  : isResolved && winningOutcome === "NO"
                  ? "text-emerald-400/30"
                  : "text-emerald-400"
              }`}>
                YES {oddsYes}%
              </span>
              <span className={`font-bold ${
                isResolved && winningOutcome === "NO" 
                  ? "text-red-400" 
                  : isResolved && winningOutcome === "YES"
                  ? "text-red-400/30"
                  : "text-red-400"
              }`}>
                NO {oddsNo}%
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500"
                initial={{ width: "50%" }}
                animate={{ width: `${oddsYes}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span className="font-mono">{volume.toFixed(1)} SOL</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{participants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{timeRemaining}</span>
            </div>
          </div>

          {/* AI Sentiment Badge */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  sentiment > 0.3 ? "#10B981" : sentiment < -0.3 ? "#EF4444" : "#FBBF24",
              }}
            />
            <span className="text-xs font-medium text-slate-300">
              AI: {sentiment > 0 ? "+" : ""}
              {sentiment.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors ${
        isResolved 
          ? "border-slate-700" 
          : "border-amber-500/20 group-hover:border-amber-500/50"
      }`} />
      <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors ${
        isResolved 
          ? "border-slate-700" 
          : "border-amber-500/20 group-hover:border-amber-500/50"
      }`} />
    </motion.div>
  );
}