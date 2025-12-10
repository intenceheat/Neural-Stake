"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[90px] sm:w-[140px] h-[36px] sm:h-[40px] bg-slate-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="wallet-adapter-button-trigger shrink-0"
    >
      <WalletMultiButton />
      
      <style jsx global>{`
        .wallet-adapter-button {
          background-color: rgb(20, 184, 166) !important;
          border-radius: 0.5rem !important;
          font-weight: 700 !important;
          color: white !important;
          padding: 0.5rem 0.75rem !important;
          transition: background-color 0.2s !important;
          font-family: var(--font-orbitron) !important;
          font-size: 0.75rem !important;
          white-space: nowrap !important;
          max-width: 110px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .wallet-adapter-button:hover {
          background-color: rgb(13, 148, 136) !important;
        }

        @media (min-width: 640px) {
          .wallet-adapter-button {
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
            max-width: none !important;
          }
        }

        @media (min-width: 768px) {
          .wallet-adapter-button {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </motion.div>
  );
}