"use client";

import { motion } from "framer-motion";
import { SentimentOrb } from "./SentimentOrb";
import { Clock, TrendingUp, Users } from "lucide-react";

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
}: MarketCardProps) {
  return (
    <motion.div
      className="group relative bg-slate-900 border border-slate-800 rounded-xl p-6 cursor-pointer overflow-hidden"
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 20px rgba(245, 158, 11, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      transition={{ duration: 0.2 }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-300" />

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
          <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors">
            {question}
          </h3>

          {/* Odds Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-emerald-400 font-bold">YES {oddsYes}%</span>
              <span className="text-red-400 font-bold">NO {oddsNo}%</span>
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
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/20 rounded-tl-xl group-hover:border-amber-500/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/20 rounded-br-xl group-hover:border-amber-500/50 transition-colors" />
    </motion.div>
  );
}