"use client"

import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"

export function MarketsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">
              All Markets
            </h1>
            <p className="text-cyan-400/60">Browse and stake on active predictions</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400/60" />
              <input
                type="text"
                placeholder="Search markets..."
                className="pl-10 pr-4 py-2 bg-slate-900/50 border border-cyan-400/20 rounded-lg text-white placeholder:text-cyan-400/40 focus:outline-none focus:border-cyan-400/40"
              />
            </div>

            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-cyan-400/20 rounded-lg text-cyan-400/80 hover:text-cyan-400 hover:border-cyan-400/40 transition-colors">
              <Filter size={18} />
              <span className="text-sm">Filter</span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-3">
          {["All", "Crypto", "Politics", "Sports", "Tech"].map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wider transition-colors ${
                category === "All"
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-900/50 border border-cyan-400/20 text-cyan-400/80 hover:text-cyan-400 hover:border-cyan-400/40"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Markets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards - replace with real market data */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              className="bg-slate-900/50 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-6 space-y-4"
              whileHover={{ borderColor: "rgba(34, 211, 238, 0.4)", y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between">
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-500 rounded uppercase tracking-wider">
                  Live
                </span>
                <span className="text-xs text-cyan-400/60">2d 14h left</span>
              </div>

              <h3 className="text-white font-medium line-clamp-2">
                Will Ethereum complete the merge by end of Q1?
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-500 font-bold">YES 68%</span>
                  <span className="text-red-500 font-bold">NO 32%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500" style={{ width: "68%" }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-cyan-400/10">
                <div className="text-xs text-cyan-400/60">
                  Volume: <span className="text-white">$2.4K</span>
                </div>
                <button className="text-xs text-amber-500 font-medium uppercase tracking-wider hover:text-amber-400">
                  Stake →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}