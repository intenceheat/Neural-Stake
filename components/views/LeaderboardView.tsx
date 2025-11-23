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
    if (user.total_positions === 0) return 0
    return Math.round((user.reputation_score / user.total_positions) * 100)
  }

  const calculateProfit = (user: User) => {
    return user.total_volume * 0.15
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
        <div className="flex items-center gap-4">
          <Trophy size={40} className="text-amber-500" />
          <div>
            <h1 className="text-4xl font-orbitron font-black text-white mb-1">
              LEADERBOARD
            </h1>
            <p className="text-slate-400">Top predictors by performance</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
              Total Predictors
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {leaders.length}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
              Total Volume
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {leaders.reduce((sum, l) => sum + l.total_volume, 0).toFixed(1)} SOL
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-widest font-orbitron mb-2">
              Total Positions
            </div>
            <div className="text-3xl font-bold text-amber-400 font-mono">
              {leaders.reduce((sum, l) => sum + l.total_positions, 0)}
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {leaders.length === 0 ? (
          <div className="text-center py-16">
            <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No predictors yet
            </h3>
            <p className="text-slate-400">
              Be the first to place a stake and claim the top spot!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
                  className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    {/* Rank Badge */}
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                      ${rank === 1 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950" : ""}
                      ${rank === 2 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950" : ""}
                      ${rank === 3 ? "bg-gradient-to-br from-orange-500 to-orange-700 text-white" : ""}
                      ${rank > 3 ? "bg-slate-800 text-cyan-400" : ""}
                    `}>
                      {rank}
                    </div>

                    {/* Wallet Address */}
                    <div className="flex-1">
                      <div className="text-white font-medium font-mono">
                        {leader.wallet_address.slice(0, 4)}...{leader.wallet_address.slice(-4)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {leader.total_positions} positions • {leader.total_volume.toFixed(2)} SOL staked
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Reputation
                        </div>
                        <div className="text-2xl font-bold text-amber-400 font-mono">
                          {leader.reputation_score.toFixed(1)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Win Rate
                        </div>
                        <div className="text-2xl font-bold text-emerald-400 font-mono">
                          {winRate}%
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                          Est. Profit
                        </div>
                        <div className="text-2xl font-bold text-cyan-400 font-mono flex items-center gap-1">
                          <TrendingUp size={16} />
                          {profit.toFixed(2)}
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