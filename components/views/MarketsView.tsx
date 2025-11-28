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
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-orbitron font-black text-white mb-2">
            MARKETS
          </h1>
          <p className="text-slate-400">
            Browse and participate in prediction markets
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 font-orbitron font-bold transition-colors ${
              activeTab === "active"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Active ({markets.filter((m) => m.status === "active").length})
          </button>
          <button
            onClick={() => setActiveTab("resolved")}
            className={`px-6 py-3 font-orbitron font-bold transition-colors ${
              activeTab === "resolved"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Resolved ({markets.filter((m) => m.status === "resolved").length})
          </button>
        </div>

        {/* Markets Grid */}
        {markets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">
              No {activeTab === "active" ? "active" : "resolved"} markets found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => {
              const odds = calculateOdds(market);
              return (
                <MarketCard
                  key={market.id}
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
                />
              );
            })}
          </div>
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
            oddsYes: calculateOdds(selectedMarket).oddsYes,
            oddsNo: calculateOdds(selectedMarket).oddsNo,
          }}
          onSuccess={refreshMarkets}
        />
      )}
    </div>
  );
}
