"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MarketCard } from "@/components/oracle/MarketCard";
import { SentimentOrb } from "@/components/oracle/SentimentOrb";
import { StakeModal } from "@/components/oracle/StakeModal";
import { OddsTicker } from "@/components/oracle/OddsTicker";
import { ActivityFeed } from "@/components/oracle/ActivityFeed";
import { WalletButton } from "@/components/wallet/WalletButton";
import { marketService, positionService, type Market } from "@/lib/supabase";

export function HomeView() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalPredictors, setTotalPredictors] = useState(0);

  useEffect(() => {
    fetchMarkets();
    fetchActivities();
    fetchStats();
    
    const activityInterval = setInterval(fetchActivities, 10000);
    return () => clearInterval(activityInterval);
  }, []);

  // Modal scroll lock
  useEffect(() => {
    if (isStakeModalOpen) {
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
  }, [isStakeModalOpen]);

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

  async function fetchStats() {
    try {
      const { supabase } = await import("@/lib/supabase");
      
      const { data: positions } = await supabase
        .from("positions")
        .select("stake_amount, user_wallet");
      
      if (positions) {
        const volume = positions.reduce((sum, pos) => sum + pos.stake_amount, 0);
        setTotalVolume(volume);
        
        const uniqueCount = new Set(positions.map(p => p.user_wallet)).size;
        setTotalPredictors(uniqueCount);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function fetchActivities() {
    try {
      const { data, error } = await (await import("@/lib/supabase")).supabase
        .from("positions")
        .select("user_wallet, stake_amount, outcome, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const formatted = (data || []).map((pos: any) => ({
        id: pos.user_wallet + pos.created_at,
        wallet: pos.user_wallet.slice(0, 4) + "..." + pos.user_wallet.slice(-4),
        outcome: pos.outcome.toUpperCase() as "YES" | "NO",
        amount: pos.stake_amount,
        reputation: Math.random() * 3 + 0.5,
        timestamp: formatTimeAgo(new Date(pos.created_at)),
      }));

      setActivities(formatted);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const refreshMarkets = async () => {
    await fetchMarkets();
    await fetchStats();
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

  const featuredMarket = markets[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
    >
      {/* Header - Always visible */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-8 h-8"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <svg viewBox="0 0 28 28" className="w-full h-full">
                <motion.path
                  d="M14 2.5L24 8.5V19.5L14 25.5L4 19.5V8.5L14 2.5Z"
                  fill="none"
                  stroke="url(#glowGradient)"
                  strokeWidth="2"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <defs>
                  <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </svg>
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-lg blur-sm"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <h1 className="text-xl font-orbitron font-black uppercase tracking-wider text-amber-400">
              Oracle Protocol
            </h1>
          </div>
          <WalletButton />
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="pt-16"
      >
        {loading ? (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="text-amber-400 text-2xl font-orbitron">
              Loading markets...
            </div>
          </div>
        ) : markets.length === 0 ? (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="text-center">
              <div className="text-amber-400 text-2xl font-orbitron mb-4">
                No active markets. Check back soon.
              </div>
              <p className="text-slate-400 text-lg">
                Connect your wallet to get started when markets are available.
              </p>
            </div>
          </div>
        ) : (
          <>
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
                      {totalVolume.toFixed(1)} SOL
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
                      {totalPredictors}
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
                    <ActivityFeed activities={activities.length > 0 ? activities : []} />
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

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
      </motion.div>

      {/* Global CSS */}
      <style jsx global>{`
        html {
          overflow-y: scroll;
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
        }
        
        body {
          overscroll-behavior-y: none;
        }

        /* Hide scrollbar - Cross-browser */
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

        /* CSS Animations for logo */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes glow-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3; 
          }
          50% { 
            transform: scale(1.3);
            opacity: 0.6; 
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}