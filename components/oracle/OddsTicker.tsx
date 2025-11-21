"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface OddsTickerProps {
  oddsYes: number;
  oddsNo: number;
  showBar?: boolean;
}

export function OddsTicker({ oddsYes, oddsNo, showBar = true }: OddsTickerProps) {
  const [displayYes, setDisplayYes] = useState(oddsYes);
  const [displayNo, setDisplayNo] = useState(oddsNo);

  useEffect(() => {
    setDisplayYes(oddsYes);
    setDisplayNo(oddsNo);
  }, [oddsYes, oddsNo]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayYes}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-4xl md:text-5xl font-bold text-emerald-400 font-orbitron">
              {displayYes}%
            </span>
            <span className="text-sm text-emerald-400/70 uppercase tracking-wider font-orbitron">
              YES
            </span>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={displayNo}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-baseline gap-2"
          >
            <span className="text-sm text-red-400/70 uppercase tracking-wider font-orbitron">
              NO
            </span>
            <span className="text-4xl md:text-5xl font-bold text-red-400 font-orbitron">
              {displayNo}%
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {showBar && (
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400"
            initial={{ width: "50%" }}
            animate={{ width: `${displayYes}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          {/* Flash effect on major changes */}
          {Math.abs(oddsYes - displayYes) > 5 && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>
      )}
    </div>
  );
}