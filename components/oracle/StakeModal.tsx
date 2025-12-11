// components/oracle/StakeModal.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, TrendingUp } from "lucide-react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProvider, placeStake, Outcome } from "@/lib/solana/oracle-program";
import { positionService, supabase } from "@/lib/supabase";

interface StakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  market: {
    id: string;
    question: string;
    poolYes: number;
    poolNo: number;
  };
  onSuccess?: () => void;
}

export function StakeModal({ isOpen, onClose, market, onSuccess }: StakeModalProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("1.0");
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  const poolYes = parseFloat(market.poolYes as any) || 0;
  const poolNo = parseFloat(market.poolNo as any) || 0;

  const getCurrentOdds = () => {
    const total = poolYes + poolNo;
    if (total === 0) {
      return { oddsYes: 50, oddsNo: 50 };
    }
    return {
      oddsYes: Math.round((poolYes / total) * 100),
      oddsNo: Math.round((poolNo / total) * 100)
    };
  };

  const calculatePayout = () => {
    const stake = parseFloat(amount) || 0;
    if (stake === 0) return 0;
    
    const totalPool = poolYes + poolNo;
    
    if (totalPool === 0) {
      return stake * 2;
    }
    
    const outcomePool = outcome === "YES" ? poolYes : poolNo;
    const newOutcomePool = outcomePool + stake;
    const newTotalPool = totalPool + stake;
    
    return (newTotalPool * stake) / newOutcomePool;
  };

  const calculateProfit = () => {
    const stake = parseFloat(amount) || 0;
    return calculatePayout() - stake;
  };

  const calculateROI = () => {
    const stake = parseFloat(amount) || 0;
    if (stake === 0) return 0;
    return (calculateProfit() / stake) * 100;
  };

  const handleStake = async () => {
    if (!connected || !publicKey || !signTransaction) {
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
      console.log("🔍 Starting stake:", { marketId: market.id, amount: stakeAmount, outcome });
      
      const wallet = { publicKey, signTransaction, signAllTransactions: async (txs: any) => txs };
      const provider = getProvider(wallet as any, connection);

      console.log("🔍 Got provider, calling placeStake...");

      const selectedOutcome = outcome === "YES" ? Outcome.Yes : Outcome.No;
      const result = await placeStake(provider, market.id, stakeAmount, selectedOutcome);

      console.log("✅ On-chain success:", result.signature);
      console.log("✅ Position PDA:", result.positionPDA.toBase58());
      console.log("🔍 Saving position to Supabase...");

      const currentOdds = getCurrentOdds();
      const odds = outcome === "YES" ? currentOdds.oddsYes : currentOdds.oddsNo;

      await positionService.create({
        market_id: market.id,
        user_wallet: publicKey.toBase58(),
        outcome: outcome.toLowerCase() as 'yes' | 'no',
        stake_amount: stakeAmount,
        odds_at_stake: odds,
        potential_payout: calculatePayout(),
        claimed: false,
        payout_amount: 0,
        transaction_signature: result.signature,
        onchain_timestamp: result.timestamp,
      });
      
      console.log("✅ Position saved");
      console.log("🔍 Updating market pools...");
      
      const { data: currentMarket } = await supabase
        .from('markets')
        .select('pool_yes, pool_no')
        .eq('market_id', market.id)
        .single();

      if (currentMarket) {
        await supabase
          .from('markets')
          .update({
            pool_yes: outcome === "YES" 
              ? (parseFloat(currentMarket.pool_yes) + stakeAmount).toString()
              : currentMarket.pool_yes,
            pool_no: outcome === "NO"
              ? (parseFloat(currentMarket.pool_no) + stakeAmount).toString()
              : currentMarket.pool_no,
          })
          .eq('market_id', market.id);
      }

      console.log("✅ Pools updated, all done!");

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (err: any) {
      console.error('❌ Stake error:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error keys:', Object.keys(err));
      console.error('❌ Error stringified:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      setError(err.message || err.toString() || 'Failed to place stake. Please try again.');
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

  const currentOdds = getCurrentOdds();

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
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border-2 border-emerald-500/20 relative pointer-events-auto shadow-2xl shadow-emerald-500/10">
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50" />
              
              {/* Content wrapper */}
              <div className="relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-2xl" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/50 rounded-br-2xl" />

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
                        POSITION LOCKED
                      </h3>
                      <p className="text-slate-300">Stake deployed successfully</p>
                    </div>
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 uppercase tracking-wider">
                      Deploy Capital
                    </h2>
                  </div>
                  <button
                    onClick={resetAndClose}
                    className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-lg"
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
                    className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg"
                  >
                    <p className="text-sm text-emerald-300">Connect your wallet to deploy capital</p>
                  </motion.div>
                )}

                {/* Market Question */}
                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="text-xs text-emerald-500/70 uppercase tracking-widest font-orbitron mb-2 font-bold">
                    TARGET MARKET
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{market.question}</p>
                </div>

                {/* Outcome Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setOutcome("YES")}
                    disabled={isStaking}
                    className={`flex-1 py-3 rounded-lg font-bold font-orbitron uppercase tracking-wider transition-all ${
                      outcome === "YES"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-105 border-2 border-emerald-400"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-2 border-slate-700"
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setOutcome("NO")}
                    disabled={isStaking}
                    className={`flex-1 py-3 rounded-lg font-bold font-orbitron uppercase tracking-wider transition-all ${
                      outcome === "NO"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50 scale-105 border-2 border-red-400"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 border-2 border-slate-700"
                    }`}
                  >
                    NO
                  </button>
                </div>

                {/* Amount Input */}
                <div className="mb-6">
                  <label className="block text-xs text-emerald-500/70 mb-2 uppercase tracking-widest font-orbitron font-bold">
                    Stake Amount (SOL)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isStaking}
                    className="w-full bg-slate-800/50 border-2 border-slate-700 rounded-lg px-4 py-3 text-3xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono disabled:opacity-50"
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
                        className="py-2 bg-slate-800/50 hover:bg-slate-700 hover:border-emerald-500/50 rounded text-sm font-bold font-mono transition-colors border border-slate-700 disabled:opacity-50"
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout Preview */}
                <motion.div
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-lg p-5 mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/5"
                  key={amount + outcome}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-xs text-emerald-500/70 mb-2 uppercase tracking-widest font-orbitron font-bold">
                    Potential Return
                  </div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-3 font-mono">
                    {calculatePayout().toFixed(2)} SOL
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400 font-bold font-mono">
                      +{calculateProfit().toFixed(2)} SOL profit
                    </span>
                    <span className="text-teal-400 font-bold font-mono">
                      {calculateROI().toFixed(0)}% ROI
                    </span>
                  </div>
                </motion.div>

                {/* Stats */}
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <span className="text-slate-400 font-orbitron text-xs uppercase tracking-wider">Current Odds:</span>
                    <span className="text-white font-bold font-mono">
                      YES {currentOdds.oddsYes}% • NO {currentOdds.oddsNo}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={resetAndClose}
                    disabled={isStaking}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold font-orbitron uppercase tracking-wider transition-colors border-2 border-slate-700 hover:border-slate-600 disabled:opacity-50"
                  >
                    ABORT
                  </button>
                  <motion.button
                    onClick={handleStake}
                    disabled={isStaking || !connected || parseFloat(amount) <= 0}
                    className="flex-1 py-3 bg-teal-500/10 hover:bg-teal-500/20 border-2 border-teal-500 hover:border-teal-400 rounded-lg font-bold font-orbitron uppercase tracking-wider text-teal-400 hover:text-teal-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden backdrop-blur-sm"
                    whileHover={{ scale: connected ? 1.02 : 1 }}
                    whileTap={{ scale: connected ? 0.98 : 1 }}
                  >
                    {isStaking ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        DEPLOYING...
                      </span>
                    ) : (
                      "DEPLOY CAPITAL →"
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}