"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/oracle/MarketCard";
import { SentimentOrb } from "@/components/oracle/SentimentOrb";
import { StakeModal } from "@/components/oracle/StakeModal";
import { OddsTicker } from "@/components/oracle/OddsTicker";
import { ActivityFeed } from "@/components/oracle/ActivityFeed";
import { WalletButton } from "@/components/wallet/WalletButton";
import { marketService, type Market } from "@/lib/supabase";

export function HomeView() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkets();
  }, []);

  async function fetchMarkets() {
    try {
      const data = await marketService.getActive();
      setMarkets(data);
    } catch (error) {
      console.error("Error fetching markets:", error);
    } finally {
      setLoading(false);
    }
  }

  const refreshMarkets = async () => {
    await fetchMarkets();
  };

  const mockActivities = [
    {
      id: "1",
      wallet: "ABC123...XYZ789",
      outcome: "YES" as const,
      amount: 5.0,
      reputation: 2.3,
      timestamp: "2m ago",
    },
    {
      id: "2",
      wallet: "DEF456...UVW012",
      outcome: "NO" as const,
      amount: 2.5,
      reputation: 1.8,
      timestamp: "5m ago",
    },
    {
      id: "3",
      wallet: "GHI789...RST345",
      outcome: "YES" as const,
      amount: 1.0,
      reputation: 1.2,
      timestamp: "8m ago",
    },
  ];

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

  const featuredMarket = markets[0];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-amber-400 text-2xl font-orbitron">
          Loading markets...
        </div>
      </motion.div>
    );
  }

  if (markets.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-amber-400 text-2xl font-orbitron">
          No active markets. Check back soon.
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600" />
            <h1 className="text-xl font-orbitron font-black uppercase tracking-wider text-amber-400">
              Oracle Protocol
            </h1>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <SentimentOrb
                sentimentScore={featuredMarket.sentiment_score}
                confidence={featuredMarket.sentiment_confidence}
                volume={featuredMarket.total_volume}
                size="xl"
              />
            </div>
            <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white mb-4">
              PREDICT SOLANA'S FUTURE
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              AI-powered prediction markets. Get paid for being right.
            </p>
          </div>

          {/* Featured Market Odds */}
          <div className="bg-slate-900 border-2 border-amber-500/20 rounded-2xl p-8 mb-8">
            <div className="text-center mb-4">
              <h3 className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
                Featured Market
              </h3>
              <p className="text-lg text-white font-bold mb-6">
                {featuredMarket.question}
              </p>
            </div>
            <OddsTicker
              oddsYes={calculateOdds(featuredMarket).oddsYes}
              oddsNo={calculateOdds(featuredMarket).oddsNo}
            />
            <button
              onClick={() => handleMarketClick(featuredMarket)}
              className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-black transition-all hover:scale-105"
            >
              STAKE NOW →
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                {markets.reduce((sum, m) => sum + m.total_volume, 0).toFixed(1)} SOL
              </div>
              <div className="text-sm text-slate-500">Total Volume</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{markets.length}</div>
              <div className="text-sm text-slate-500">Active Markets</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">
                {markets.reduce((sum, m) => sum + m.participant_count, 0)}
              </div>
              <div className="text-sm text-slate-500">Predictors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Markets List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-orbitron font-bold text-white">
                  Active Markets
                </h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                    Active
                  </button>
                  <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-sm text-slate-400 transition-colors">
                    Resolved
                  </button>
                </div>
              </div>

              <div className="space-y-4">
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
            </div>

            {/* Activity Feed Sidebar */}
            <div className="lg:col-span-1">
              <ActivityFeed activities={mockActivities} />
            </div>
          </div>
        </div>
      </section>

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
    </motion.div>
  );
}