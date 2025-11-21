"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    question: string;
    oddsYes: number;
    oddsNo: number;
  };
  userReputation?: number;
}

export function StakeModal({ isOpen, onClose, market, userReputation = 1.8 }: StakeModalProps) {
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("1.0");
  const [isStaking, setIsStaking] = useState(false);

  const calculatePayout = () => {
    const stake = parseFloat(amount) || 0;
    const odds = outcome === "YES" ? market.oddsYes : market.oddsNo;
    if (odds === 0) return 0;
    return stake * (100 / odds);
  };

  const calculateProfit = () => {
    const stake = parseFloat(amount) || 0;
    return calculatePayout() - stake;
  };

  const calculateROI = () => {
    const stake = parseFloat(amount) || 0;
    if (stake === 0) return 0;
    return ((calculatePayout() / stake - 1) * 100);
  };

  const handleStake = async () => {
    setIsStaking(true);
    
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsStaking(false);
    onClose();
    
    // TODO: Actual Solana transaction logic
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border-2 border-amber-500/20 relative">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-500/50 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-500/50 rounded-br-2xl" />

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-orbitron font-bold text-amber-400 uppercase tracking-wider">
                  Place Stake
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Market Question */}
              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 line-clamp-2">{market.question}</p>
              </div>

              {/* Outcome Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setOutcome("YES")}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    outcome === "YES"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  YES
                </button>
                <button
                  onClick={() => setOutcome("NO")}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    outcome === "NO"
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  NO
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2 uppercase tracking-wider font-orbitron">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-3xl font-bold text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                  step="0.1"
                  min="0.1"
                  placeholder="0.0"
                />

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[0.5, 1.0, 2.5, 5.0].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className="py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-bold transition-colors border border-slate-700 hover:border-slate-600"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Preview */}
              <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-5 mb-6 border border-amber-500/20"
                key={amount + outcome}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-orbitron">
                  Potential Payout
                </div>
                <div className="text-4xl font-bold text-amber-400 mb-2 font-mono">
                  {calculatePayout().toFixed(2)} SOL
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-400 font-bold">
                    +{calculateProfit().toFixed(2)} SOL profit
                  </span>
                  <span className="text-amber-400 font-bold">
                    {calculateROI().toFixed(0)}% ROI
                  </span>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-400">Current Odds:</span>
                  <span className="text-white font-bold font-mono">
                    YES {market.oddsYes}% • NO {market.oddsNo}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                  <span className="text-slate-400">Your Reputation:</span>
                  <span className="text-amber-400 font-bold">
                    {userReputation.toFixed(1)}x (Veteran)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors border border-slate-700"
                >
                  CANCEL
                </button>
                <motion.button
                  onClick={handleStake}
                  disabled={isStaking || parseFloat(amount) <= 0}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isStaking ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      CONFIRMING...
                    </span>
                  ) : (
                    "CONFIRM STAKE →"
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}