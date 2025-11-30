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
      <div className="w-[140px] h-[40px] bg-slate-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="wallet-adapter-button-trigger"
    >
      <WalletMultiButton
        className="!bg-amber-500 hover:!bg-amber-600 !rounded-lg !font-bold !text-black !px-4 !py-2 !transition-colors"
        style={{
          fontFamily: "var(--font-orbitron)",
        }}
      />
    </motion.div>
  );
}