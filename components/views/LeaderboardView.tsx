"use client"

import { motion } from "framer-motion"
import { Trophy, TrendingUp } from "lucide-react"

export function LeaderboardView() {
  // Mock data
  const leaders = [
    { rank: 1, address: "Bmt4...FHM7", winRate: 89, totalStaked: 5420, profit: 1850 },
    { rank: 2, address: "9xK2...pL3R", winRate: 84, totalStaked: 4100, profit: 1320 },
    { rank: 3, address: "7nF5...qM8W", winRate: 81, totalStaked: 3800, profit: 1100 },
    { rank: 4, address: "4dR8...tN2Y", winRate: 78, totalStaked: 3200, profit: 890 },
    { rank: 5, address: "2mP6...vQ7X", winRate: 75, totalStaked: 2900, profit: 720 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen p-8"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Trophy size={40} className="text-amber-500" />
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">
              Leaderboard
            </h1>
            <p className="text-cyan-400/60">Top predictors by performance</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {leaders.map((leader, index) => (
            <motion.div
              key={leader.address}
              className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ borderColor: "rgba(34, 211, 238, 0.4)" }}
            >
              <div className="flex items-center gap-6">
                {/* Rank */}
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                  ${leader.rank === 1 ? "bg-amber-500 text-slate-950" : ""}
                  ${leader.rank === 2 ? "bg-slate-400 text-slate-950" : ""}
                  ${leader.rank === 3 ? "bg-orange-600 text-white" : ""}
                  ${leader.rank > 3 ? "bg-slate-800 text-cyan-400" : ""}
                `}>
                  {leader.rank}
                </div>

                {/* Address */}
                <div className="flex-1">
                  <div className="text-white font-medium font-mono">{leader.address}</div>
                  <div className="text-xs text-cyan-400/60 mt-1">
                    Total Staked: ${leader.totalStaked.toLocaleString()}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-xs text-cyan-400/60 uppercase mb-1">Win Rate</div>
                    <div className="text-2xl font-bold text-emerald-500">{leader.winRate}%</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs text-cyan-400/60 uppercase mb-1">Profit</div>
                    <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                      <TrendingUp size={20} />
                      ${leader.profit}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}