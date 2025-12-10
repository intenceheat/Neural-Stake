"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/oracle/MarketCard";
import { StakeModal } from "@/components/oracle/StakeModal";
import { OddsTicker } from "@/components/oracle/OddsTicker";
import { ActivityFeed } from "@/components/oracle/ActivityFeed";
import { WalletButton } from "@/components/wallet/WalletButton";
import { marketService, type Market } from "@/lib/supabase";

export function HomeView() {
  const [selectedPredictionMarket, setSelectedPredictionMarket] = useState<Market | null>(null);
  const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);
  const [predictionMarkets, setPredictionMarkets] = useState<Market[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [aggregatedVolume, setAggregatedVolume] = useState(0);
  const [uniquePredictors, setUniquePredictors] = useState(0);

  useEffect(() => {
    loadPredictionMarkets();
    loadRecentActivity();
    loadPlatformStats();
    
    const activityRefreshInterval = setInterval(loadRecentActivity, 10000);
    return () => clearInterval(activityRefreshInterval);
  }, []);

  useEffect(() => {
    if (isPredictionModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isPredictionModalOpen]);

  async function loadPredictionMarkets() {
    try {
      const marketData = await marketService.getActive();
      setPredictionMarkets(marketData);
    } catch (error) {
      console.error("Error loading prediction markets:", error);
    } finally {
      setIsLoadingMarkets(false);
    }
  }

  async function loadPlatformStats() {
    try {
      const { supabase } = await import("@/lib/supabase");
      
      const { data: positionData } = await supabase
        .from("positions")
        .select("stake_amount, user_wallet");
      
      if (positionData) {
        const volumeSum = positionData.reduce((accumulator, position) => accumulator + position.stake_amount, 0);
        setAggregatedVolume(volumeSum);
        
        const uniqueWalletCount = new Set(positionData.map(position => position.user_wallet)).size;
        setUniquePredictors(uniqueWalletCount);
      }
    } catch (error) {
      console.error("Error loading platform stats:", error);
    }
  }

  async function loadRecentActivity() {
    try {
      const { data, error } = await (await import("@/lib/supabase")).supabase
        .from("positions")
        .select("user_wallet, stake_amount, outcome, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedActivity = (data || []).map((position: any) => ({
        id: position.user_wallet + position.created_at,
        wallet: position.user_wallet.slice(0, 4) + "..." + position.user_wallet.slice(-4),
        outcome: position.outcome.toUpperCase() as "YES" | "NO",
        amount: position.stake_amount,
        reputation: Math.random() * 3 + 0.5,
        timestamp: calculateTimeAgo(new Date(position.created_at)),
      }));

      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error("Error loading recent activity:", error);
      setRecentActivity([]);
    }
  }

  const calculateTimeAgo = (timestamp: Date) => {
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - timestamp.getTime();
    const minutesElapsed = Math.floor(timeDifference / 60000);
    const hoursElapsed = Math.floor(timeDifference / 3600000);
    const daysElapsed = Math.floor(timeDifference / 86400000);

    if (minutesElapsed < 1) return "now";
    if (minutesElapsed < 60) return `${minutesElapsed}m ago`;
    if (hoursElapsed < 24) return `${hoursElapsed}h ago`;
    return `${daysElapsed}d ago`;
  };

  const refreshAllMarketData = async () => {
    await loadPredictionMarkets();
    await loadPlatformStats();
  };

  const handlePredictionMarketClick = (market: Market) => {
    setSelectedPredictionMarket(market);
    setIsPredictionModalOpen(true);
  };

  const calculateMarketOdds = (market: Market) => {
    const totalPool = market.pool_yes + market.pool_no;
    if (totalPool === 0) {
      return { oddsYes: 50, oddsNo: 50 };
    }
    const probabilityYes = Math.round((market.pool_yes / totalPool) * 100);
    const probabilityNo = 100 - probabilityYes;
    return { oddsYes: probabilityYes, oddsNo: probabilityNo };
  };

  const calculateTimeRemaining = (endTimestamp: string) => {
    const endDate = new Date(endTimestamp);
    const currentDate = new Date();
    const timeRemaining = endDate.getTime() - currentDate.getTime();
    
    if (timeRemaining <= 0) return "Ended";
    
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (daysRemaining > 0) return `${daysRemaining}d ${hoursRemaining}h`;
    return `${hoursRemaining}h`;
  };

  const spotlightMarket = predictionMarkets[0];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-10">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm pb-6 -mx-4 px-4 pt-4 border-b border-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl" />
                <h1 className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 mb-3 tracking-tight">
                  ORACLE PROTOCOL
                </h1>
                <p className="text-slate-400 text-lg font-light">
                  Stake on outcomes. Shape the future. Earn rewards.
                </p>
              </div>
              <WalletButton />
            </div>
          </div>

          {/* Content */}
          {isLoadingMarkets ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-teal-400 text-2xl font-space-grotesk font-bold">
                Loading prediction markets...
              </div>
            </div>
          ) : predictionMarkets.length === 0 ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <div className="text-teal-400 text-2xl font-space-grotesk font-bold mb-4">
                  No active prediction markets available.
                </div>
                <p className="text-slate-400 text-lg font-inter">
                  Connect your wallet to get started when markets launch.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <motion.section
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              >
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-4xl md:text-5xl font-space-grotesk font-black text-white mb-4 tracking-tight">
                      SHAPE THE FUTURE WITH CONVICTION
                    </h2>
                    <p className="text-xl text-slate-400 font-inter mb-8">
                      AI-powered prediction markets. Bet on truth. Dominate uncertainty.
                    </p>
                  </div>

                  {/* Featured Market */}
                  <div className="bg-slate-900 border-2 border-teal-500/20 rounded-2xl p-8 mb-8">
                    <div className="text-center mb-4">
                      <h3 className="text-sm text-slate-500 uppercase tracking-widest font-space-grotesk font-bold mb-2">
                        Featured Battleground
                      </h3>
                      <p className="text-lg text-white font-inter font-semibold mb-6">
                        {spotlightMarket.question}
                      </p>
                    </div>
                    <OddsTicker
                      oddsYes={calculateMarketOdds(spotlightMarket).oddsYes}
                      oddsNo={calculateMarketOdds(spotlightMarket).oddsNo}
                    />
                    <button
                      onClick={() => handlePredictionMarketClick(spotlightMarket)}
                      className="w-full mt-6 py-3 bg-teal-500 hover:bg-teal-600 rounded-lg font-space-grotesk font-bold text-white transition-all hover:scale-105"
                    >
                      ENTER THE ARENA →
                    </button>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-center gap-6 mb-12">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-400 font-space-grotesk">
                        {aggregatedVolume.toFixed(1)} SOL
                      </div>
                      <div className="text-sm text-slate-500 font-inter">Total Deployed</div>
                    </div>
                    <div className="w-px h-12 bg-slate-700" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-400 font-space-grotesk">{predictionMarkets.length}</div>
                      <div className="text-sm text-slate-500 font-inter">Active Arenas</div>
                    </div>
                    <div className="w-px h-12 bg-slate-700" />
                    <div className="text-center">
                      <div className="text-3xl font-bold text-teal-400 font-space-grotesk">
                        {uniquePredictors}
                      </div>
                      <div className="text-sm text-slate-500 font-inter">Elite Operators</div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Markets Grid */}
              <motion.section
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-space-grotesk font-black text-white tracking-tight">
                          Active Battlegrounds
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {predictionMarkets.map((market) => {
                          const marketOdds = calculateMarketOdds(market);
                          return (
                            <MarketCard
                              key={market.id}
                              marketId={market.market_id}
                              question={market.question}
                              oddsYes={marketOdds.oddsYes}
                              oddsNo={marketOdds.oddsNo}
                              sentiment={market.sentiment_score}
                              confidence={market.sentiment_confidence}
                              volume={market.total_volume}
                              participants={market.participant_count}
                              timeRemaining={calculateTimeRemaining(market.end_time)}
                              onClick={() => handlePredictionMarketClick(market)}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <ActivityFeed activities={recentActivity.length > 0 ? recentActivity : []} />
                    </div>
                  </div>
                </div>
              </motion.section>
            </>
          )}
        </div>
      </div>

      {selectedPredictionMarket && (
        <StakeModal
          isOpen={isPredictionModalOpen}
          onClose={() => setIsPredictionModalOpen(false)}
          market={{
            id: selectedPredictionMarket.market_id,
            question: selectedPredictionMarket.question,
            poolYes: selectedPredictionMarket.pool_yes,
            poolNo: selectedPredictionMarket.pool_no,
          }}
          onSuccess={refreshAllMarketData}
        />
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap");

        html {
          overflow-y: scroll;
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
        }
        
        body {
          overscroll-behavior-y: none;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: transparent;
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .font-space-grotesk {
          font-family: "Space Grotesk", monospace;
        }

        .font-inter {
          font-family: "Inter", sans-serif;
        }
      `}</style>
    </div>
  );
}