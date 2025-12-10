// components/views/intel/LiveMarketPulse.tsx

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react'
import { useNeural } from '@/contexts/NeuralContext'

export function LiveMarketPulse() {
  const { marketData, isLoading, lastUpdate, fetchData } = useNeural();

  if (marketData.length === 0 && !isLoading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl h-full">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Activity className="w-12 h-12 text-cyan-400/50" />
          <div className="text-slate-400 text-center">No market intelligence available</div>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 font-semibold transition-all"
          >
            ACTIVATE NEURAL SCAN
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
          <Activity className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Live Market Intelligence</h2>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-slate-500">
              Updated {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s ago
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Processing neural patterns...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {marketData.map((data, index) => (
            <motion.div
              key={data.token}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Token Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    data.token === 'SOL' ? 'bg-purple-500/20 text-purple-400' :
                    data.token === 'BTC' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {data.token}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">
                      ${data.price.toLocaleString()}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${data.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {data.change24h >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">{data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%</span>
                      <span className="text-slate-500 text-xs">24h</span>
                    </div>
                  </div>
                </div>
                
                {/* Confidence Badge */}
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1">Neural Confidence</div>
                  <div className={`text-2xl font-bold ${
                    data.confidence >= 75 ? 'text-emerald-400' :
                    data.confidence >= 60 ? 'text-cyan-400' :
                    'text-amber-400'
                  }`}>
                    {data.confidence}%
                  </div>
                </div>
              </div>

              {/* AI Prediction */}
              <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                    Neural Prediction
                  </span>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {data.prediction}
                </p>
              </div>

              {/* Confidence Bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      data.confidence >= 75 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' :
                      data.confidence >= 60 ? 'bg-gradient-to-r from-cyan-400 to-purple-400' :
                      'bg-gradient-to-r from-amber-400 to-orange-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.confidence}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}