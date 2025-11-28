// components/views/PositionsView.tsx - UPDATED WITH CLAIM FLOW

"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
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
    if (!publicKey || !pos.market || !signTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    // Check if market is resolved
    if (pos.market.status !== "resolved") {
      toast.error("Market not resolved yet");
      return;
    }

    // Check if already claimed
    if (pos.claimed) {
      toast.info("Position already claimed");
      return;
    }

    // Check if winner
    if (pos.market.winning_outcome !== pos.outcome) {
      toast.error("Losing position, no payout");
      return;
    }

    try {
      setClaimingId(pos.id);
      
      // Extract timestamp from position creation
      const positionCreatedAt = new Date(pos.created_at).getTime();
      const positionTimestamp = Math.floor(positionCreatedAt / 1000);

      // Call on-chain claim instruction
      const { signature } = await claimPayout(
        getProvider({ publicKey } as any, connection),
        pos.market_id,
        positionTimestamp
      );

      // Update local DB with claim status
      await positionService.claim(pos.id, pos.potential_payout);

      toast.success(`Claim submitted: ${signature.slice(0, 8)}...`);
      
      // Refresh positions
      await fetchPositions();
    } catch (error: any) {
      console.error("Claim failed:", error);
      toast.error(error.message || "Claim failed");
    } finally {
      setClaimingId(null);
    }
  }

  const activePositions = positions.filter((p) => p.market?.status === "active");
  const resolvedPositions = positions.filter((p) => p.market?.status === "resolved");

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
              Connect Wallet
            </h2>
            <p className="text-slate-400">
              Connect your wallet to view your positions
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  const displayedPositions = activeTab === "active" ? activePositions : resolvedPositions;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-orbitron font-black text-white mb-2">
            MY POSITIONS
          </h1>
          <p className="text-slate-400">
            Track your predictions and performance
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
              Total Staked
            </div>
            <div className="text-3xl font-bold text-white font-mono">
              {totalStaked.toFixed(2)} SOL
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
              Total Profit
            </div>
            <div className={`text-3xl font-bold font-mono ${totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)} SOL
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
              Win Rate
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {winRate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === "active"
                ? "bg-amber-500 text-black"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Active ({activePositions.length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === "resolved"
                ? "bg-amber-500 text-black"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Resolved ({resolvedPositions.length})
          </button>
        </div>

        {/* Positions List */}
        {displayedPositions.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No {activeTab} positions
            </h3>
            <p className="text-slate-400">
              {activeTab === "active" 
                ? "Place your first stake to get started"
                : "No resolved markets yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedPositions.map((pos) => {
              const currentValue = calculateCurrentValue(pos);
              const unrealizedPL = currentValue - pos.stake_amount;
              const isWinner = pos.market?.winning_outcome === pos.outcome;
              const canClaim = pos.market?.status === "resolved" && isWinner && !pos.claimed;

              return (
                <motion.div
                  key={pos.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {pos.market?.question || "Market not found"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                          pos.outcome === "yes" 
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {pos.outcome === "yes" ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span className="font-bold uppercase">{pos.outcome}</span>
                        </div>
                        
                        <span className="text-slate-500">
                          {new Date(pos.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {activeTab === "resolved" && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {pos.payout_amount > 0 ? (
                            <>
                              <CheckCircle className="w-6 h-6 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">WON</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-400" />
                              <span className="text-red-400 font-bold">LOST</span>
                            </>
                          )}
                        </div>

                        {canClaim && (
                          <button
                            onClick={() => handleClaim(pos)}
                            disabled={claimingId === pos.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                              claimingId === pos.id
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                            }`}
                          >
                            {claimingId === pos.id ? (
                              <>
                                <motion.div
                                  className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity }}
                                />
                                Claiming...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Claim
                              </>
                            )}
                          </button>
                        )}

                        {pos.claimed && (
                          <div className="text-emerald-400 text-sm font-bold">✓ CLAIMED</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Staked
                      </div>
                      <div className="text-lg font-bold text-white font-mono">
                        {pos.stake_amount.toFixed(2)} SOL
                      </div>
                    </div>

                    {activeTab === "active" ? (
                      <>
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            Current Value
                          </div>
                          <div className="text-lg font-bold text-amber-400 font-mono">
                            {currentValue.toFixed(2)} SOL
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            Unrealized P&L
                          </div>
                          <div className={`text-lg font-bold font-mono ${
                            unrealizedPL >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {unrealizedPL >= 0 ? "+" : ""}{unrealizedPL.toFixed(2)} SOL
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            Potential Payout
                          </div>
                          <div className="text-lg font-bold text-white font-mono">
                            {pos.potential_payout.toFixed(2)} SOL
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            Payout
                          </div>
                          <div className="text-lg font-bold text-white font-mono">
                            {pos.payout_amount.toFixed(2)} SOL
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            Profit/Loss
                          </div>
                          <div className={`text-lg font-bold font-mono ${
                            (pos.payout_amount - pos.stake_amount) >= 0 
                              ? "text-emerald-400" 
                              : "text-red-400"
                          }`}>
                            {(pos.payout_amount - pos.stake_amount) >= 0 ? "+" : ""}
                            {(pos.payout_amount - pos.stake_amount).toFixed(2)} SOL
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                            ROI
                          </div>
                          <div className={`text-lg font-bold font-mono ${
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
                      <div className="text-xs text-slate-500">
                        Odds at entry: {pos.odds_at_stake.toFixed(1)}% • 
                        Current odds: {pos.market ? (
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
  );
}