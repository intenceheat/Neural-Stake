// components/views/intel/RecentPredictions.tsx

'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingUp, TrendingDown, Trash2, Wallet, AlertTriangle } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState, useCallback, memo } from 'react'
import { supabase } from '@/lib/supabase'

interface SavedPrediction {
  id: string
  token: string
  price: number
  change_24h: number
  confidence: number
  prediction_text: string
  saved_at: string
}

// Memoized prediction card to prevent unnecessary rerenders
const PredictionCard = memo(({ 
  prediction, 
  onDelete, 
  isDeleting,
  deleteWarningId,
  onDeleteWarning 
}: { 
  prediction: SavedPrediction
  onDelete: (id: string) => void
  isDeleting: boolean
  deleteWarningId: string | null
  onDeleteWarning: (id: string) => void
}) => {
  const showWarning = deleteWarningId === prediction.id

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const saved = new Date(timestamp)
    const diff = now.getTime() - saved.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <motion.div
      layout
      className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 hover:border-cyan-400/40 rounded-xl p-4 md:p-5 transition-all duration-300 group relative"
    >
      {/* Delete Button - Two-stage */}
      <button
        onClick={() => showWarning ? onDelete(prediction.id) : onDeleteWarning(prediction.id)}
        disabled={isDeleting}
        className={`absolute top-3 right-3 p-2 border rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          showWarning 
            ? 'bg-red-500/20 hover:bg-red-500/30 border-red-400/50 hover:border-red-400' 
            : 'bg-slate-900/80 hover:bg-slate-700/80 border-slate-700/50 hover:border-slate-600'
        }`}
        title={showWarning ? "Click again to confirm delete" : "Delete prediction"}
      >
        {showWarning ? (
          <AlertTriangle className={`w-4 h-4 text-red-400 ${isDeleting ? 'animate-pulse' : ''}`} />
        ) : (
          <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
        )}
      </button>

      {/* Token Header */}
      <div className="flex items-center justify-between mb-4 pr-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg ${
            prediction.token === 'SOL' ? 'bg-purple-500/20 text-purple-300 shadow-purple-500/20' :
            prediction.token === 'BTC' ? 'bg-orange-500/20 text-orange-300 shadow-orange-500/20' :
            'bg-blue-500/20 text-blue-300 shadow-blue-500/20'
          }`}>
            {prediction.token}
          </div>
          <div>
            <div className="text-white font-bold text-lg">
              ${prediction.price.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-sm ${prediction.change_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {prediction.change_24h >= 0 ? (
                <TrendingUp className="w-4 h-4" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="w-4 h-4" strokeWidth={2.5} />
              )}
              <span className="font-bold">{prediction.change_24h >= 0 ? '+' : ''}{prediction.change_24h.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="text-right">
          <div className={`text-2xl font-black tabular-nums ${
            prediction.confidence >= 75 ? 'text-emerald-400' :
            prediction.confidence >= 60 ? 'text-cyan-400' :
            'text-amber-400'
          }`}>
            {prediction.confidence}%
          </div>
        </div>
      </div>

      {/* Prediction Text */}
      <div className="bg-slate-900/60 rounded-lg p-3 mb-3 border border-cyan-400/10">
        <p className="text-slate-300 text-xs md:text-sm leading-relaxed line-clamp-3">
          {prediction.prediction_text}
        </p>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
        <Clock className="w-3 h-3" />
        <span>Saved {getTimeAgo(prediction.saved_at)}</span>
      </div>
    </motion.div>
  )
})

PredictionCard.displayName = 'PredictionCard'

export function RecentPredictions() {
  const { publicKey, connected } = useWallet()
  const [predictions, setPredictions] = useState<SavedPrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteWarningId, setDeleteWarningId] = useState<string | null>(null)
  
  const walletAddress = publicKey?.toBase58()

  const loadPredictions = useCallback(async () => {
    if (!connected || !walletAddress) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('saved_predictions')
        .select('*')
        .eq('user_wallet', walletAddress)
        .order('saved_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setPredictions(data || [])
    } catch (error) {
      console.error('Error loading predictions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [connected, walletAddress])

  useEffect(() => {
    if (connected && walletAddress) {
      loadPredictions()
    } else {
      setPredictions([])
    }
  }, [connected, walletAddress, loadPredictions])

  // Real-time subscription for instant updates
  useEffect(() => {
    if (!connected || !walletAddress) return

    const channel = supabase
      .channel('saved_predictions_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'saved_predictions',
          filter: `user_wallet=eq.${walletAddress}`
        },
        (payload) => {
          setPredictions(prev => [payload.new as SavedPrediction, ...prev].slice(0, 10))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'saved_predictions',
          filter: `user_wallet=eq.${walletAddress}`
        },
        (payload) => {
          setPredictions(prev => prev.filter(p => p.id !== (payload.old as any).id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [connected, walletAddress])

  const handleDeleteWarning = useCallback((id: string) => {
    setDeleteWarningId(id)
    // Auto-reset warning after 3 seconds
    setTimeout(() => {
      setDeleteWarningId(prev => prev === id ? null : prev)
    }, 3000)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    setDeleteWarningId(null)
    
    try {
      const { error } = await supabase
        .from('saved_predictions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Real-time subscription will handle the UI update
    } catch (error) {
      console.error('Error deleting prediction:', error)
      alert('Failed to delete prediction')
      // Reload on error
      loadPredictions()
    } finally {
      setDeletingId(null)
    }
  }, [loadPredictions])

  // Not connected state
  if (!connected || !publicKey) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div className="flex flex-col items-center justify-center gap-6 py-12 relative z-10">
          <Wallet className="w-16 h-16 text-cyan-400 opacity-50" />
          
          <div className="text-center">
            <div className="text-slate-300 font-medium text-lg mb-2">
              Wallet not connected
            </div>
            <div className="text-slate-500 text-sm">
              Connect your wallet to view saved predictions
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div className="flex items-center justify-center h-64 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <div className="text-slate-400 font-medium">Loading predictions...</div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (predictions.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div className="flex flex-col items-center justify-center gap-4 py-12 relative z-10">
          <Clock className="w-12 h-12 text-slate-600" />
          <div className="text-center">
            <div className="text-slate-400 font-medium text-lg mb-1">
              No saved predictions yet
            </div>
            <div className="text-slate-500 text-sm">
              Save predictions from the Live Feed to track them here
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Predictions list
  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-400/20 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            SAVED INTEL
          </h2>
        </div>
        <div className="text-sm text-slate-500 font-mono">
          {predictions.length} {predictions.length === 1 ? 'prediction' : 'predictions'}
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4 relative z-10">
        {predictions.map((prediction) => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            onDelete={handleDelete}
            onDeleteWarning={handleDeleteWarning}
            isDeleting={deletingId === prediction.id}
            deleteWarningId={deleteWarningId}
          />
        ))}
      </div>
    </div>
  )
}