// components/views/intel/LiveMarketPulse.tsx

'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, RefreshCw, Zap, Bookmark, BookmarkCheck } from 'lucide-react'
import { useNeural } from '@/contexts/NeuralContext'
import { useWallet } from '@solana/wallet-adapter-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function LiveMarketPulse() {
  const { marketData, isLoading, lastUpdate, fetchData } = useNeural();
  const { publicKey, connected } = useWallet();
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [savedTokens, setSavedTokens] = useState<Record<string, boolean>>({});

  const handleSavePrediction = async (data: any) => {
    if (!connected || !publicKey) {
      alert('Connect wallet to save predictions');
      return;
    }

    const token = data.token;
    setSavingStates(prev => ({ ...prev, [token]: true }));

    try {
      const { error } = await supabase
        .from('saved_predictions')
        .insert({
          user_wallet: publicKey.toBase58(),
          token: data.token,
          price: data.price,
          change_24h: data.change24h,
          confidence: data.confidence,
          prediction_text: data.prediction,
        });

      if (error) throw error;

      setSavedTokens(prev => ({ ...prev, [token]: true }));
      
      // Reset saved state after 2 seconds
      setTimeout(() => {
        setSavedTokens(prev => ({ ...prev, [token]: false }));
      }, 2000);
    } catch (error) {
      console.error('Error saving prediction:', error);
      alert('Failed to save prediction');
    } finally {
      setSavingStates(prev => ({ ...prev, [token]: false }));
    }
  };

  if (marketData.length === 0 && !isLoading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 shadow-2xl h-full relative overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div className="flex flex-col items-center justify-center h-full gap-6 relative z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Activity className="w-16 h-16 text-cyan-400" />
          </motion.div>
          
          <div className="text-slate-300 text-center font-medium text-lg">
            Neural network offline
          </div>
          
          <button
            onClick={fetchData}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/40 hover:to-purple-500/40 border border-cyan-400/50 hover:border-cyan-400 rounded-xl text-cyan-400 font-bold tracking-wider transition-all duration-300 flex items-center gap-3 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30"
          >
            <Zap className="w-5 h-5 group-hover:animate-pulse" />
            INITIALIZE SCAN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-6 h-6 text-cyan-400" />
          </motion.div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            LIVE FEED
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <motion.span 
              className="text-xs md:text-sm text-slate-500 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Math.floor((Date.now() - lastUpdate.getTime()) / 1000)}s
            </motion.span>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-400/30 hover:border-cyan-400/60 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-400 transition-transform ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 duration-500'}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
            />
            <div className="text-slate-400 font-medium">Processing signals...</div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          {marketData.map((data, index) => {
            const isSaved = savedTokens[data.token];
            const isSaving = savingStates[data.token];

            return (
              <motion.div
                key={data.token}
                className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-cyan-400/40 rounded-xl p-5 md:p-6 transition-all duration-300 group relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                {/* Save Button */}
                <button
                  onClick={() => handleSavePrediction(data)}
                  disabled={isSaving || isSaved}
                  className="absolute top-4 right-4 p-2.5 bg-slate-900/80 hover:bg-cyan-500/20 border border-slate-700/50 hover:border-cyan-400/50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group/save"
                  title={isSaved ? "Saved!" : "Save prediction"}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Bookmark className={`w-5 h-5 text-slate-400 group-hover/save:text-cyan-400 transition-colors ${isSaving ? 'animate-pulse' : ''}`} />
                  )}
                </button>

                {/* Token Header */}
                <div className="flex items-center justify-between mb-5 pr-12">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shadow-lg ${
                      data.token === 'SOL' ? 'bg-purple-500/20 text-purple-300 shadow-purple-500/20' :
                      data.token === 'BTC' ? 'bg-orange-500/20 text-orange-300 shadow-orange-500/20' :
                      'bg-blue-500/20 text-blue-300 shadow-blue-500/20'
                    }`}>
                      {data.token}
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl md:text-2xl tracking-tight">
                        ${data.price.toLocaleString()}
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm md:text-base ${data.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {data.change24h >= 0 ? (
                          <TrendingUp className="w-5 h-5" strokeWidth={2.5} />
                        ) : (
                          <TrendingDown className="w-5 h-5" strokeWidth={2.5} />
                        )}
                        <span className="font-bold">{data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%</span>
                        <span className="text-slate-500 text-xs font-mono">24H</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Confidence Badge */}
                  <div className="text-right">
                    <div className="text-xs text-slate-500 mb-1 font-mono uppercase tracking-wider">
                      Confidence
                    </div>
                    <div className={`text-3xl md:text-4xl font-black tabular-nums ${
                      data.confidence >= 75 ? 'text-emerald-400' :
                      data.confidence >= 60 ? 'text-cyan-400' :
                      'text-amber-400'
                    }`}>
                      {data.confidence}<span className="text-2xl">%</span>
                    </div>
                  </div>
                </div>

                {/* AI Prediction */}
                <div className="bg-slate-900/80 rounded-xl p-5 border border-cyan-400/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                  
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div 
                      className="w-2 h-2 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">
                      Neural Output
                    </span>
                  </div>
                  
                  <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                    {data.prediction}
                  </p>
                </div>

                {/* Confidence Bar */}
                <div className="mt-4">
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      className={`h-full shadow-lg ${
                        data.confidence >= 75 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-emerald-400/50' :
                        data.confidence >= 60 ? 'bg-gradient-to-r from-cyan-400 to-purple-400 shadow-cyan-400/50' :
                        'bg-gradient-to-r from-amber-400 to-orange-400 shadow-amber-400/50'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.confidence}%` }}
                      transition={{ duration: 1.2, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  )
}