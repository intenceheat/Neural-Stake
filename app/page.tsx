"use client";

import { useState } from "react";
import { MarketCard } from "@/components/oracle/MarketCard";
import { SentimentOrb } from "@/components/oracle/SentimentOrb";
import { StakeModal } from "@/components/oracle/StakeModal";
import { OddsTicker } from "@/components/oracle/OddsTicker";
import { ActivityFeed } from "@/components/oracle/ActivityFeed";

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  // Mock data
  const mockMarkets = [
    {
      marketId: "jup-1",
      question: "Will Jupiter (JUP) hit $2.00 by December 31, 2024?",
      oddsYes: 73,
      oddsNo: 27,
      sentiment: 0.82,
      confidence: 87,
      volume: 142.5,
      participants: 67,
      timeRemaining: "12h 34m",
    },
    {
      marketId: "bonk-1",
      question: "Will BONK burn 1 trillion tokens this quarter?",
      oddsYes: 45,
      oddsNo: 55,
      sentiment: 0.23,
      confidence: 65,
      volume: 89.3,
      participants: 42,
      timeRemaining: "3d 8h",
    },
    {
      marketId: "sol-1",
      question: "Will Solana TPS exceed 10,000 sustained for 1 hour?",
      oddsYes: 38,
      oddsNo: 62,
      sentiment: -0.15,
      confidence: 72,
      volume: 156.8,
      participants: 93,
      timeRemaining: "5d 2h",
    },
  ];

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

  const handleMarketClick = (market: any) => {
    setSelectedMarket(market);
    setIsStakeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600" />
            <h1 className="text-xl font-orbitron font-black uppercase tracking-wider text-amber-400">
              Oracle Protocol
            </h1>
          </div>
          <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-black transition-colors">
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <SentimentOrb
                sentimentScore={0.75}
                confidence={92}
                volume={450}
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
                {mockMarkets[0].question}
              </p>
            </div>
            <OddsTicker
              oddsYes={mockMarkets[0].oddsYes}
              oddsNo={mockMarkets[0].oddsNo}
            />
            <button
              onClick={() => handleMarketClick(mockMarkets[0])}
              className="w-full mt-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-lg font-bold text-black transition-all hover:scale-105"
            >
              STAKE NOW →
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">$10K+</div>
              <div className="text-sm text-slate-500">Prize Pool</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">67</div>
              <div className="text-sm text-slate-500">Active Markets</div>
            </div>
            <div className="w-px h-12 bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">1.2K</div>
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
                {mockMarkets.map((market) => (
                  <MarketCard
                    key={market.marketId}
                    {...market}
                    onClick={() => handleMarketClick(market)}
                  />
                ))}
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
            id: selectedMarket.marketId,
            question: selectedMarket.question,
            oddsYes: selectedMarket.oddsYes,
            oddsNo: selectedMarket.oddsNo,
          }}
        />
      )}
    </div>
  );
}