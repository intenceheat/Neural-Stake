// components/views/MarketsView.tsx - COMPLETE REBUILD

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, TrendingUp } from "lucide-react"
import { marketService, type Market } from "@/lib/supabase"
import { MarketCard } from "@/components/oracle/MarketCard"
import { StakeModal } from "@/components/oracle/StakeModal"

export function MarketsView() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false)

  useEffect(() => {
    fetchMarkets()
  }, [])

  async function fetchMarkets() {
    try {
      setLoading(true)
      const data = await marketService.getActive()
      setMarkets(data)
    } catch (error) {
      console.error("Error fetching markets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market)
    setIsStakeModalOpen(true)
  }

  const handleStakeSuccess = () => {
    fetchMarkets() // Refresh markets after successful stake
  }

  const calculateOdds = (market: Market) => {
    const total = market.pool_yes + market.pool_no
    if (total === 0) {
      return { oddsYes: 50, oddsNo: 50 }
    }
    const oddsYes = Math.round((market.pool_yes / total) * 100)
    const oddsNo = 100 - oddsYes
    return { oddsYes, oddsNo }
  }

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return "Ended"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    return `${hours}h`
  }

  const filteredMarkets = markets.filter(market => 
    market.question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-orbitron font-black text-white mb-2">
              ALL MARKETS
            </h1>
            <p className="text-slate-400">
              Browse and stake on active predictions
            </p>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-slate-500">
              <span className="text-amber-400 font-bold">{filteredMarkets.length}</span> markets
            </div>
            <div className="text-slate-500">
              <span className="text-amber-400 font-bold">
                {markets.reduce((sum, m) => sum + m.total_volume, 0).toFixed(1)} SOL
              </span> volume
            </div>
          </div>
        </div>

        {/* Markets Grid */}
        {filteredMarkets.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No markets found
            </h3>
            <p className="text-slate-400">
              {searchQuery ? "Try a different search" : "Check back soon for new markets"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((market) => {
              const odds = calculateOdds(market)
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
              )
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
          onSuccess={handleStakeSuccess}
        />
      )}
    </div>
  )
}