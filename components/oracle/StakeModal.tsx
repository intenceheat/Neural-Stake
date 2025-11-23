"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { stakingService } from "@/lib/staking";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    question: string;
    oddsYes: number;
    oddsNo: number;
  };
  onSuccess?: () => void;
}

export function StakeModal({ isOpen, onClose, market, onSuccess }: StakeModalProps) {
  const { publicKey, connected } = useWallet();
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("1.0");
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow value
      const originalOverflow = document.body.style.overflow;
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      
      // Cleanup: restore scrolling when modal closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleStake = async () => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    const stakeAmount = parseFloat(amount);
    if (stakeAmount <= 0) {
      setError("Invalid stake amount");
      return;
    }

    setIsStaking(true);
    setError(null);

    try {
      const result = await stakingService.placeStake({
        userWallet: publicKey.toBase58(),
        marketId: market.id,
        outcome: outcome.toLowerCase() as 'yes' | 'no',
        stakeAmount: stakeAmount,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to place stake');
      }

      // Show success state
      setSuccess(true);

      // Wait 2 seconds then close and refresh
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('Stake error:', err);
      setError(err.message || 'Failed to place stake. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const resetAndClose = () => {
    setError(null);
    setSuccess(false);
    setAmount("1.0");
    setOutcome("YES");
    onClose();
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
            onClick={resetAndClose}
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

              {/* Success State */}
              {success && (
                <motion.div
                  className="absolute inset-0 bg-emerald-500/10 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full mb-4"
                    >
                      <Check className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">
                      STAKE PLACED!
                    </h3>
                    <p className="text-slate-300">Position recorded successfully</p>
                  </div>
                </motion.div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-orbitron font-bold text-amber-400 uppercase tracking-wider">
                  Place Stake
                </h2>
                <button
                  onClick={resetAndClose}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                  disabled={isStaking}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Wallet Not Connected Warning */}
              {!connected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-amber-500/10 border border-amber-500/50 rounded-lg"
                >
                  <p className="text-sm text-amber-300">Connect your wallet to place a stake</p>
                </motion.div>
              )}

              {/* Market Question */}
              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-300 line-clamp-2">{market.question}</p>
              </div>

              {/* Outcome Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setOutcome("YES")}
                  disabled={isStaking}
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
                  disabled={isStaking}
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
                  disabled={isStaking}
                  className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-3xl font-bold text-white focus:outline-none focus:border-amber-500 transition-colors font-mono disabled:opacity-50"
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
                      disabled={isStaking}
                      className="py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-bold transition-colors border border-slate-700 hover:border-slate-600 disabled:opacity-50"
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
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetAndClose}
                  disabled={isStaking}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors border border-slate-700 disabled:opacity-50"
                >
                  CANCEL
                </button>
                <motion.button
                  onClick={handleStake}
                  disabled={isStaking || !connected || parseFloat(amount) <= 0}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  whileHover={{ scale: connected ? 1.02 : 1 }}
                  whileTap={{ scale: connected ? 0.98 : 1 }}
                  >
                  {isStaking ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      STAKING...
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