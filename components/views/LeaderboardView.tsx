// components/views/LeaderboardView.tsx - FULL FILE

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, TrendingUp, Award } from "lucide-react"
import { userService, type User } from "@/lib/supabase"

export function LeaderboardView() {
  const [leaders, setLeaders] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaders()
  }, [])

  async function fetchLeaders() {
    try {
      setLoading(true)
      const data = await userService.getLeaderboard(20)
      setLeaders(data)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateWinRate = (user: User) => {
    if (user.total_positions === 0) return 0;
    return Math.round((user.winning_positions / user.total_positions) * 100);
  }
  
  const calculateProfit = (user: User) => {
    return user.total_profit;
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
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-orange-500/10 blur-3xl" />
          <div className="relative flex items-center gap-4 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border border-amber-500/30 rounded-2xl p-8 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-xl opacity-50" />
              <Trophy size={48} className="relative text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            </div>
            <div>
              <h1 className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-400 to-orange-400 mb-2 tracking-tight">
                RANKINGS
              </h1>
              <p className="text-amber-200/80 font-medium tracking-wide">Elite predictors of mortality • Ranked by carnage</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-slate-900/90 border border-amber-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-xs text-amber-400/70 uppercase tracking-[0.2em] font-orbitron mb-2 font-bold">
                Total Reapers
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 font-mono">
                {leaders.length}
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-slate-900/90 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-xs text-red-400/70 uppercase tracking-[0.2em] font-orbitron mb-2 font-bold">
                Blood Wagered
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-300 font-mono">
                {leaders.reduce((sum, l) => sum + l.total_volume, 0).toFixed(1)} SOL
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-slate-900/90 border border-orange-500/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-xs text-orange-400/70 uppercase tracking-[0.2em] font-orbitron mb-2 font-bold">
                Calls
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300 font-mono">
                {leaders.reduce((sum, l) => sum + l.total_positions, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {leaders.length === 0 ? (
          <div className="text-center py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-xl" />
            <div className="relative">
              <Trophy className="w-20 h-20 text-slate-700 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">
                No reapers yet
              </h3>
              <p className="text-slate-400 text-lg">
                Claim your throne. Bet on mortality. Ascend to glory.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => {
              const rank = index + 1
              const winRate = calculateWinRate(leader)
              const profit = calculateProfit(leader)

              return (
                <motion.div
                  key={leader.wallet_address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className={`
                    absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity
                    ${rank === 1 ? "bg-gradient-to-r from-amber-500/30 to-yellow-500/30" : ""}
                    ${rank === 2 ? "bg-gradient-to-r from-slate-400/30 to-slate-300/30" : ""}
                    ${rank === 3 ? "bg-gradient-to-r from-orange-500/30 to-red-500/30" : ""}
                    ${rank > 3 ? "bg-gradient-to-r from-slate-700/20 to-slate-600/20" : ""}
                  `} />
                  <div className={`
                    relative bg-slate-900/95 rounded-xl p-4 sm:p-6 backdrop-blur-sm transition-all group-hover:scale-[1.02]
                    ${rank === 1 ? "border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : ""}
                    ${rank === 2 ? "border-2 border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.2)]" : ""}
                    ${rank === 3 ? "border-2 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]" : ""}
                    ${rank > 3 ? "border border-slate-700/50" : ""}
                  `}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      {/* Rank Badge */}
                      <div className={`
                        relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold text-lg sm:text-xl font-orbitron shadow-lg shrink-0
                        ${rank === 1 ? "bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 text-slate-950 shadow-amber-500/50" : ""}
                        ${rank === 2 ? "bg-gradient-to-br from-slate-300 via-slate-100 to-slate-400 text-slate-950 shadow-slate-400/50" : ""}
                        ${rank === 3 ? "bg-gradient-to-br from-orange-500 via-red-500 to-orange-700 text-white shadow-orange-500/50" : ""}
                        ${rank > 3 ? "bg-gradient-to-br from-slate-800 to-slate-700 text-cyan-400 border border-slate-600" : ""}
                      `}>
                        {rank === 1 && <Trophy className="absolute w-4 h-4 sm:w-5 sm:h-5 -top-1 -right-1 text-amber-300" />}
                        {rank}
                      </div>

                      {/* Wallet Address */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold font-mono text-base sm:text-lg tracking-wider">
                          {leader.wallet_address.slice(0, 4)}...{leader.wallet_address.slice(-4)}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-amber-400/80">{leader.total_positions} predictions</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-red-400/80">{leader.total_volume.toFixed(2)} SOL staked</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
                        <div className="text-center flex-1 sm:flex-none">
                          <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.15em] mb-1 font-orbitron">
                            Reputation
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                            {leader.reputation_score.toFixed(1)}
                          </div>
                        </div>

                        <div className="text-center flex-1 sm:flex-none">
                          <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.15em] mb-1 font-orbitron">
                            Accuracy
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                            {winRate}%
                          </div>
                        </div>

                        <div className="text-center flex-1 sm:flex-none">
                          <div className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-[0.15em] mb-1 font-orbitron">
                            Profit
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-cyan-400 font-mono flex items-center justify-center gap-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                            <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
                            {profit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}