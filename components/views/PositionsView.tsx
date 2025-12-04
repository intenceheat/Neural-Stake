// components/views/PositionsView.tsx - TACTICAL WARFARE INTERFACE - FIXED

"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import type { Transaction } from "@solana/web3.js";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Wallet, Send } from "lucide-react";
import { positionService, marketService, type Position, type Market } from "@/lib/supabase";
import { claimPayout, getProvider, Outcome } from "@/lib/solana/oracle-program";
import { toast } from "sonner";

interface PositionWithMarket extends Position {
  market?: Market;
}

export function PositionsView() {
  const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [positions, setPositions] = useState<PositionWithMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchPositions();
    } else {
      setPositions([]);
      setLoading(false);
    }
  }, [connected, publicKey]);

  async function fetchPositions() {
    if (!publicKey) return;

    try {
      setLoading(true);
      const userPositions = await positionService.getByUser(publicKey.toBase58());

      const positionsWithMarkets = await Promise.all(
        userPositions.map(async (pos) => {
          try {
            const market = await marketService.getById(pos.market_id);
            return { ...pos, market };
          } catch (err) {
            return { ...pos, market: undefined };
          }
        })
      );

      setPositions(positionsWithMarkets);
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(pos: PositionWithMarket) {
    console.log("=== CLAIM STARTED ===", pos);
    
    if (!publicKey || !pos.market || !signTransaction) {
      toast.error("Wallet not connected");
      return;
    }
  
    if (pos.market.status !== "resolved") {
      toast.error("Market not resolved yet");
      return;
    }
  
    if (pos.claimed) {
      toast.info("Position already claimed");
      return;
    }
  
    if (pos.market.winning_outcome?.toUpperCase() !== pos.outcome?.toUpperCase()) {
      toast.error("Losing position, no payout");
      return;
    }
  
    try {
      setClaimingId(pos.id);
      
      const positionTimestamp = pos.onchain_timestamp;
      
      console.log("📍 Calling claimPayout:", pos.market_id, positionTimestamp);
  
      const wallet = {
        publicKey,
        signTransaction,
        signAllTransactions: async (txs: Transaction[]) => {
          return await Promise.all(txs.map(tx => signTransaction(tx)));
        }
      };
      
      const { signature } = await claimPayout(
        getProvider(wallet as AnchorWallet, connection),
        pos.market_id,
        positionTimestamp
      );
  
      const totalPool = pos.market.pool_yes + pos.market.pool_no;
      const winningPool = pos.market.winning_outcome?.toUpperCase() === "YES" 
        ? pos.market.pool_yes 
        : pos.market.pool_no;
  
      const actualPayout = winningPool > 0 
        ? (totalPool * pos.stake_amount) / winningPool 
        : 0;
  
      console.log("✅ Signature:", signature);
      console.log("💰 Actual Payout:", actualPayout);
  
      await positionService.claim(pos.id, actualPayout);
      toast.success(`Claimed ${actualPayout.toFixed(2)} SOL!`);
      await fetchPositions();
    } catch (error: any) {
      console.error("❌ ERROR:", error);
      toast.error(error.message || "Claim failed");
    } finally {
      setClaimingId(null);
    }
  }

  const activePositions = positions.filter((p) => p.market?.status === "active");
  const resolvedPositions = positions
    .filter((p) => p.market?.status === "resolved")
    .sort((a, b) => {
      const aResolved = a.market?.resolved_at ? new Date(a.market.resolved_at).getTime() : 0;
      const bResolved = b.market?.resolved_at ? new Date(b.market.resolved_at).getTime() : 0;
      return bResolved - aResolved;
    });

  const totalStaked = positions.reduce((sum, p) => sum + p.stake_amount, 0);
  const totalProfit = resolvedPositions.reduce((sum, p) => sum + (p.payout_amount - p.stake_amount), 0);
  const winRate = resolvedPositions.length > 0
    ? (resolvedPositions.filter((p) => p.payout_amount > 0).length / resolvedPositions.length) * 100
    : 0;

  const calculateCurrentValue = (pos: PositionWithMarket) => {
    if (!pos.market) return pos.stake_amount;
    
    const total = pos.market.pool_yes + pos.market.pool_no;
    if (total === 0) return pos.stake_amount * 2;

    const yourPool = pos.outcome === "yes" ? pos.market.pool_yes : pos.market.pool_no;
    return yourPool > 0 ? (total / yourPool) * pos.stake_amount : pos.stake_amount * 2;
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
                CONNECT WALLET
              </h2>
              <p className="text-slate-400">
                Link your arsenal to view combat positions
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="min-h-[60vh] flex items-center justify-center">
            <motion.div
              className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  const displayedPositions = activeTab === "active" ? activePositions : resolvedPositions;

  return (
    <>
      {/* FIXED TACTICAL HEADER */}
      <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-slate-950/95 border-b border-amber-500/30 shadow-2xl shadow-amber-500/10">
        <div className="container mx-auto px-6 md:px-8 py-6 max-w-6xl">
        <div className="md:pl-16"> 
            <h1 className="text-4xl md:text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-orange-600 mb-1 tracking-tight">
              COMBAT POSITIONS
            </h1>
            <p className="text-amber-500/60 font-bold tracking-widest text-xs uppercase">
              Tactical Engagement Overview
            </p>
          </div>
        </div>
      </div>

      {/* Main content with proper top padding */}
      <div className="pt-32 pb-16 min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <div className="space-y-8">
            {/* BATTLEFIELD STATISTICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border-2 border-amber-500/20 rounded-xl p-6 shadow-xl shadow-amber-500/5 hover:border-amber-500/40 transition-all"
              >
                <div className="text-xs text-amber-500/70 uppercase tracking-[0.2em] font-orbitron mb-3 font-bold">
                  TOTAL DEPLOYED
                </div>
                <div className="text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {totalStaked.toFixed(2)} <span className="text-2xl text-amber-500/60">SOL</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border-2 border-emerald-500/20 rounded-xl p-6 shadow-xl shadow-emerald-500/5 hover:border-emerald-500/40 transition-all"
              >
                <div className="text-xs text-emerald-500/70 uppercase tracking-[0.2em] font-orbitron mb-3 font-bold">
                  NET PROFIT/LOSS
                </div>
                <div className={`text-4xl font-black font-mono tracking-tight ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)} <span className="text-2xl opacity-60">SOL</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800/90 border-2 border-red-500/20 rounded-xl p-6 shadow-xl shadow-red-500/5 hover:border-red-500/40 transition-all"
              >
                <div className="text-xs text-red-500/70 uppercase tracking-[0.2em] font-orbitron mb-3 font-bold">
                  KILL RATE
                </div>
                <div className="text-4xl font-black text-red-400 font-mono tracking-tight">
                  {winRate.toFixed(0)}<span className="text-2xl text-red-500/60">%</span>
                </div>
              </motion.div>
            </div>

            {/* MISSION SELECTOR */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("active")}
                className={`px-8 py-4 rounded-xl font-orbitron font-black text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "active"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-amber-500/50 scale-105"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
                }`}
              >
                ⚡ ACTIVE MISSIONS ({activePositions.length})
              </button>
              <button
                onClick={() => setActiveTab("resolved")}
                className={`px-8 py-4 rounded-xl font-orbitron font-black text-sm uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "resolved"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black shadow-lg shadow-amber-500/50 scale-105"
                    : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700/50"
                }`}
              >
                ✓ COMPLETED ({resolvedPositions.length})
              </button>
            </div>

            {/* COMBAT LOG */}
            {displayedPositions.length === 0 ? (
              <div className="text-center py-24">
                <Clock className="w-20 h-20 text-slate-700 mx-auto mb-6" />
                <h3 className="text-2xl font-orbitron font-bold text-white mb-3">
                  NO {activeTab.toUpperCase()} ENGAGEMENTS
                </h3>
                <p className="text-slate-500 text-lg">
                  {activeTab === "active" 
                    ? "Deploy capital to initiate combat operations"
                    : "No completed missions in battle log"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayedPositions.map((pos) => {
                  const currentValue = calculateCurrentValue(pos);
                  const unrealizedPL = currentValue - pos.stake_amount;
                  const isWinner = pos.market?.winning_outcome?.toUpperCase() === pos.outcome?.toUpperCase();
                  const canClaim = pos.market?.status === "resolved" && isWinner && !pos.claimed;

                  return (
                    <motion.div
                      key={pos.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01 }}
                      className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800/80 border-2 border-slate-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all duration-300 shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-3 font-orbitron tracking-tight">
                            {pos.market?.question || "UNKNOWN TARGET"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 ${
                              pos.outcome === "yes" 
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                : "bg-red-500/20 text-red-400 border-red-500/40"
                            }`}>
                              {pos.outcome === "yes" ? (
                                <TrendingUp className="w-5 h-5" />
                              ) : (
                                <TrendingDown className="w-5 h-5" />
                              )}
                              <span className="font-orbitron uppercase tracking-wider">{pos.outcome}</span>
                            </div>
                            
                            <span className="text-slate-500 font-mono">
                              {new Date(pos.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {activeTab === "resolved" && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                            {isWinner ? (
                                <>
                                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                                  <span className="text-emerald-400 font-orbitron font-black text-lg">VICTOR</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-7 h-7 text-red-400" />
                                  <span className="text-red-400 font-orbitron font-black text-lg">ELIMINATED</span>
                                </>
                              )}
                            </div>

                            {canClaim && (
                              <button
                                onClick={() => handleClaim(pos)}
                                disabled={claimingId === pos.id}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-orbitron font-black uppercase tracking-wider transition-all ${
                                  claimingId === pos.id
                                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-black hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/50"
                                }`}
                              >
                                {claimingId === pos.id ? (
                                  <>
                                    <motion.div
                                      className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full"
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 0.8, repeat: Infinity }}
                                    />
                                    Extracting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-5 h-5" />
                                    EXTRACT SPOILS
                                  </>
                                )}
                              </button>
                            )}

                            {pos.claimed && (
                              <div className="text-emerald-400 font-orbitron font-black text-sm px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                                ✓ EXTRACTED
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                            CAPITAL DEPLOYED
                          </div>
                          <div className="text-xl font-black text-white font-mono">
                            {pos.stake_amount.toFixed(2)} SOL
                          </div>
                        </div>

                        {activeTab === "active" ? (
                          <>
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                                CURRENT VALUE
                              </div>
                              <div className="text-xl font-black text-amber-400 font-mono">
                                {currentValue.toFixed(2)} SOL
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                                UNREALIZED P&L
                              </div>
                              <div className={`text-xl font-black font-mono ${
                                unrealizedPL >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}>
                                {unrealizedPL >= 0 ? "+" : ""}{unrealizedPL.toFixed(2)} SOL
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                                MAX EXTRACTION
                              </div>
                              <div className="text-xl font-black text-white font-mono">
                                {pos.potential_payout.toFixed(2)} SOL
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                                PAYOUT
                              </div>
                              <div className="text-xl font-black text-white font-mono">
                                {pos.payout_amount.toFixed(2)} SOL
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                                PROFIT/LOSS
                              </div>
                              <div className={`text-xl font-black font-mono ${
                                (pos.payout_amount - pos.stake_amount) >= 0 
                                  ? "text-emerald-400" 
                                  : "text-red-400"
                              }`}>
                                {(pos.payout_amount - pos.stake_amount) >= 0 ? "+" : ""}
                                {(pos.payout_amount - pos.stake_amount).toFixed(2)} SOL
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-widest font-orbitron mb-2 font-bold">
                                ROI
                              </div>
                              <div className={`text-xl font-black font-mono ${
                                pos.payout_amount > pos.stake_amount
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}>
                                {((pos.payout_amount / pos.stake_amount - 1) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {activeTab === "active" && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                          <div className="text-xs text-slate-500 font-mono">
                            Entry odds: {pos.odds_at_stake.toFixed(1)}% • 
                            Live odds: {pos.market ? (
                              pos.outcome === "yes" 
                                ? ((pos.market.pool_yes / (pos.market.pool_yes + pos.market.pool_no)) * 100).toFixed(1)
                                : ((pos.market.pool_no / (pos.market.pool_yes + pos.market.pool_no)) * 100).toFixed(1)
                            ) : "N/A"}%
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INVISIBLE SCROLLBAR STYLES - Cross-browser */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        *::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: transparent;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        * {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        /* Ensure smooth scrolling */
        html {
          scroll-behavior: smooth;
          overflow-y: scroll;
        }

        body {
          overflow-x: hidden;
        }
      `}</style>
    </>
  );
}