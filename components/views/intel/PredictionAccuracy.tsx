// components/views/intel/PredictionAccuracy.tsx

'use client'

import { motion } from 'framer-motion'
import { Target, TrendingUp, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface AccuracyStats {
  accuracy: number
  totalPredictions: number
  correct: number
  incorrect: number
  streak: number
}

export function PredictionAccuracy() {
  const [stats, setStats] = useState<AccuracyStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDFLARE_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: 'accuracy-stats' })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch accuracy stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!stats && !isLoading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl h-full">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Target className="w-12 h-12 text-purple-400/50" />
          <div className="text-slate-400 text-center">Neural accuracy metrics unavailable</div>
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-500/50 rounded-lg text-purple-400 font-semibold transition-all"
          >
            LOAD METRICS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Neural Accuracy</h2>
        </div>
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-purple-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-slate-400">Analyzing patterns...</div>
        </div>
      ) : stats ? (
        <>
          {/* Big Accuracy Number */}
          <div className="mb-6">
            <div className="text-center">
              <motion.div
                className="text-6xl font-black bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
              >
                {stats.accuracy.toFixed(1)}%
              </motion.div>
              <div className="text-slate-400 text-sm uppercase tracking-wider">
                Prediction Accuracy
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800/40 border border-emerald-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">CORRECT</span>
              </div>
              <div className="text-white text-2xl font-bold">{stats.correct}</div>
            </div>

            <div className="bg-slate-800/40 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-xs font-semibold">INCORRECT</span>
              </div>
              <div className="text-white text-2xl font-bold">{stats.incorrect}</div>
            </div>
          </div>

          {/* Total Predictions */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 mb-4">
            <div className="text-slate-400 text-xs mb-1">TOTAL PREDICTIONS</div>
            <div className="text-white text-3xl font-bold">{stats.totalPredictions}</div>
          </div>

          {/* Win Streak */}
          <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-purple-400 text-xs font-semibold mb-1 uppercase tracking-wider">
                  Current Streak
                </div>
                <div className="text-white text-2xl font-bold">{stats.streak} Consecutive</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}