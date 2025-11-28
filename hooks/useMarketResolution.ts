"use client";

import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { getProvider, Outcome, resolveMarket } from "@/lib/solana/oracle-program";
import { marketService } from "@/lib/supabase";

type WinningOutcome = "yes" | "no";

export function useMarketResolution() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [resolving, setResolving] = useState<string | null>(null);

  const resolve = useCallback(
    async (marketId: string, outcome: WinningOutcome) => {
      if (!connected || !publicKey || !signTransaction) {
        toast.error("Connect the authority wallet before resolving a market.");
        return;
      }

      if (!connection) {
        toast.error("No Solana connection available.");
        return;
      }

      try {
        setResolving(marketId);

        const wallet = {
          publicKey,
          signTransaction,
          signAllTransactions:
            signAllTransactions ??
            (async (transactions: any[]) => transactions),
        };

        const provider = getProvider(wallet as any, connection);
        const winningOutcome = outcome === "yes" ? Outcome.Yes : Outcome.No;

        const { signature } = await resolveMarket(
          provider,
          marketId,
          winningOutcome
        );

        await marketService.resolve(marketId, outcome);

        toast.success(
          `Market ${marketId} resolved to ${outcome.toUpperCase()} (${signature.slice(
            0,
            8
          )}...)`
        );
      } catch (error: any) {
        console.error("Market resolution failed:", error);
        toast.error(error?.message ?? "Failed to resolve market.");
        throw error;
      } finally {
        setResolving((current) => (current === marketId ? null : current));
      }
    },
    [connected, publicKey, signTransaction, signAllTransactions, connection]
  );

  return { resolve, resolving };
}