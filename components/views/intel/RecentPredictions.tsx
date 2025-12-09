// components/views/intel/RecentPredictions.tsx

'use client'

import { motion } from 'framer-motion'
import { History, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface Prediction {
  id: string
  token: string
  prediction: string
  confidence: number
  outcome: 'correct' | 'incorrect' | 'pending'
  timestamp: string
  targetPrice?: number
  actualPrice?: number
}

export function RecentPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchPredictions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDFLARE_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: 'recent-predictions' })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setPredictions(data)
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (predictions.length === 0 && !isLoading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Neural History</h2>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <History className="w-12 h-12 text-emerald-400/50" />
          <div className="text-slate-400 text-center">No prediction history available</div>
          <button
            onClick={fetchPredictions}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 font-semibold transition-all"
          >
            LOAD HISTORY
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Neural History</h2>
        </div>
        <button
          onClick={fetchPredictions}
          disabled={isLoading}
          className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading prediction history...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {predictions.map((pred, index) => (
            <motion.div
              key={pred.id}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                      pred.token === 'SOL' ? 'bg-purple-500/20 text-purple-400' :
                      pred.token === 'BTC' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {pred.token}
                    </div>
                    <div className="text-sm text-slate-400">
                      {new Date(pred.timestamp).toLocaleDateString()} • {new Date(pred.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{pred.prediction}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Confidence: {pred.confidence}%</span>
                    {pred.targetPrice && (
                      <span className="text-slate-500">Target: ${pred.targetPrice.toLocaleString()}</span>
                    )}
                    {pred.actualPrice && (
                      <span className="text-slate-500">Actual: ${pred.actualPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                
                {/* Outcome Badge */}
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  pred.outcome === 'correct' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  pred.outcome === 'incorrect' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {pred.outcome === 'correct' && <CheckCircle2 className="w-3 h-3" />}
                  {pred.outcome === 'incorrect' && <XCircle className="w-3 h-3" />}
                  {pred.outcome === 'pending' && <Clock className="w-3 h-3" />}
                  <span className="uppercase">{pred.outcome}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}