"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";

export function WalletButton() {
  const { publicKey, disconnect } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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
      >
        {publicKey ? formatAddress(publicKey.toBase58()) : "Connect Wallet"}
      </WalletMultiButton>
    </motion.div>
  );
}