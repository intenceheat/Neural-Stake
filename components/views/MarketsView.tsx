"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/oracle/MarketCard";
import { StakeModal } from "@/components/oracle/StakeModal";
import { marketService, type Market } from "@/lib/supabase";

export function MarketsView() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "resolved">("active");

  useEffect(() => {
    fetchMarkets();
  }, [activeTab]);

  async function fetchMarkets() {
    try {
      setLoading(true);
      if (activeTab === "active") {
        const data = await marketService.getActive();
        setMarkets(data);
      } else {
        const allMarkets = await marketService.getAll();
        const resolved = allMarkets.filter((m) => m.status === "resolved");
        setMarkets(resolved);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setLoading(false);
    }
  }

  const refreshMarkets = async () => {
    await fetchMarkets();
  };

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market);
    setIsStakeModalOpen(true);
  };

  const calculateOdds = (market: Market) => {
    const total = market.pool_yes + market.pool_no;
    if (total === 0) {
      return { oddsYes: 50, oddsNo: 50 };
    }
    const oddsYes = Math.round((market.pool_yes / total) * 100);
    const oddsNo = 100 - oddsYes;
    return { oddsYes, oddsNo };
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Terminated";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="min-h-[70vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative w-20 h-20"
          >
            <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
          <h1 className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 mb-3 tracking-tight">
            PREDICTION MARKETS
          </h1>
          <p className="text-slate-400 text-lg font-light">
            Stake on outcomes. Shape the future. Earn rewards.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="flex gap-3 p-1.5 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 w-fit"
        >
          <button
            onClick={() => setActiveTab("active")}
            className={`relative px-8 py-3.5 font-orbitron font-bold rounded-lg transition-all duration-300 ${
              activeTab === "active"
                ? "text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <span className="relative z-10">Live Contracts</span>
            {activeTab === "active" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ml-2 text-sm ${activeTab === "active" ? "text-slate-900" : "text-slate-500"}`}>
              {markets.filter((m) => m.status === "active").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`relative px-8 py-3.5 font-orbitron font-bold rounded-lg transition-all duration-300 ${
              activeTab === "resolved"
                ? "text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <span className="relative z-10">Executed</span>
            {activeTab === "resolved" && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className={`relative z-10 ml-2 text-sm ${activeTab === "resolved" ? "text-slate-900" : "text-slate-500"}`}>
              {markets.filter((m) => m.status === "resolved").length}
            </span>
          </button>
        </motion.div>

        {/* Markets Grid */}
        {markets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center py-24 px-6"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-400 text-xl font-light mb-2">
                No {activeTab === "active" ? "live" : "executed"} contracts available
              </p>
              <p className="text-slate-500 text-sm">
                Check back soon for new prediction opportunities
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {markets.map((market, index) => {
              const odds = calculateOdds(market);
              return (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
                >
                  <MarketCard
                    marketId={market.market_id}
                    question={market.question}
                    oddsYes={odds.oddsYes}
                    oddsNo={odds.oddsNo}
                    sentiment={market.sentiment_score}
                    confidence={market.sentiment_confidence}
                    volume={market.total_volume}
                    participants={market.participant_count}
                    timeRemaining={getTimeRemaining(market.end_time)}
                    onClick={() => handleMarketClick(market)}
                    isResolved={market.status === "resolved"}
                    winningOutcome={market.winning_outcome as "YES" | "NO" | null} 
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Stake Modal */}
      {selectedMarket && (
        <StakeModal
        isOpen={isStakeModalOpen}
        onClose={() => setIsStakeModalOpen(false)}
        market={{
          id: selectedMarket.market_id,
          question: selectedMarket.question,
          poolYes: selectedMarket.pool_yes,
          poolNo: selectedMarket.pool_no,
        }}
        onSuccess={refreshMarkets}
      />
      )}
    </div>
  );
}