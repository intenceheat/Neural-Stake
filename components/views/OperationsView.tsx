// components/views/OperationsView.tsx

'use client'

import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp } from 'lucide-react'
import { LiveMarketPulse } from './intel/LiveMarketPulse'
import { PredictionAccuracy } from './intel/PredictionAccuracy'
import { RecentPredictions } from './intel/RecentPredictions'

export function OperationsView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 md:ml-[120px]">
      {/* Header Section */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-cyan-500/20 rounded-lg blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <Brain className="w-8 h-8 text-cyan-400 relative z-10" strokeWidth={2} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
            NEURAL EDGE
          </h1>
        </div>
        <p className="text-slate-400 text-sm md:text-base">
          AI-powered market intelligence and prediction analytics
        </p>
      </motion.div>

      {/* Live Status Indicator */}
      <motion.div
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-800/40 border border-cyan-500/30 rounded-lg w-fit"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div
          className="w-2 h-2 bg-cyan-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <span className="text-cyan-400 text-sm font-medium">NEURAL NETWORK ACTIVE</span>
        <Zap className="w-4 h-4 text-cyan-400" />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Live Market Pulse - Takes 2 columns */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LiveMarketPulse />
        </motion.div>

        {/* Prediction Accuracy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PredictionAccuracy />
        </motion.div>
      </div>

      {/* Recent Predictions Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <RecentPredictions />
      </motion.div>
    </div>
  )
}