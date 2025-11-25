// components/oracle/StakeModal.tsx - REPLACE ENTIRE FILE

"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { TrendingUp, TrendingDown, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { getProvider, placeStake, Outcome } from "@/lib/solana/oracle-program"
import { positionService } from "@/lib/supabase"

interface StakeModalProps {
  isOpen: boolean
  onClose: () => void
  market: {
    id: string
    question: string
    oddsYes: number
    oddsNo: number
  }
  onSuccess?: () => void
}

export function StakeModal({ isOpen, onClose, market, onSuccess }: StakeModalProps) {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  
  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no" | null>(null)
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const calculatePayout = () => {
    const stakeAmount = parseFloat(amount)
    if (!stakeAmount || !selectedOutcome) return 0

    const odds = selectedOutcome === "yes" ? market.oddsYes : market.oddsNo
    return (stakeAmount / odds) * 100
  }

  const handleSubmit = async () => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place a stake",
        variant: "destructive",
      })
      return
    }

    if (!selectedOutcome || !amount) {
      toast({
        title: "Missing information",
        description: "Please select an outcome and enter an amount",
        variant: "destructive",
      })
      return
    }

    const stakeAmount = parseFloat(amount)
    if (stakeAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Get provider with proper wallet adapter type
      const wallet = { publicKey, signTransaction, signAllTransactions: async (txs: any) => txs }
      const provider = getProvider(wallet as any, connection)

      // Call on-chain place_stake
      const outcome = selectedOutcome === "yes" ? Outcome.Yes : Outcome.No
      const result = await placeStake(provider, market.id, stakeAmount, outcome)

      console.log("Transaction signature:", result.signature)
      console.log("Position PDA:", result.positionPDA.toBase58())

      // Save to Supabase for tracking
      const odds = selectedOutcome === "yes" ? market.oddsYes : market.oddsNo
      const potentialPayout = calculatePayout()

      await positionService.create({
        market_id: market.id,
        user_wallet: publicKey.toBase58(),
        outcome: selectedOutcome,
        stake_amount: stakeAmount,
        odds_at_stake: odds,
        potential_payout: potentialPayout,
        claimed: false,
        payout_amount: 0,
        transaction_signature: result.signature,
      })

      toast({
        title: "Stake placed successfully! 🎯",
        description: `${stakeAmount} SOL on ${selectedOutcome.toUpperCase()}`,
      })

      // Reset form
      setSelectedOutcome(null)
      setAmount("")
      
      onClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Error placing stake:", error)
      toast({
        title: "Transaction failed",
        description: error.message || "Failed to place stake. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const payout = calculatePayout()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Market Question */}
        <div className="mb-6">
          <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
            Place Your Stake
          </h2>
          <p className="text-slate-400 text-sm">{market.question}</p>
        </div>

        {/* Outcome Selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setSelectedOutcome("yes")}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedOutcome === "yes"
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-lg text-white">YES</span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {market.oddsYes}%
            </div>
          </button>

          <button
            onClick={() => setSelectedOutcome("no")}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedOutcome === "no"
                ? "border-red-500 bg-red-500/10"
                : "border-slate-700 hover:border-slate-600"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              <span className="font-bold text-lg text-white">NO</span>
            </div>
            <div className="text-2xl font-mono font-bold text-red-400">
              {market.oddsNo}%
            </div>
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Stake Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.1"
            min="0"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-lg focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Potential Payout */}
        {amount && selectedOutcome && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6"
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Potential Payout</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                {payout.toFixed(2)} SOL
              </span>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedOutcome || !amount || isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "PROCESSING..." : "CONFIRM STAKE"}
        </button>
      </motion.div>
    </div>
  )
}