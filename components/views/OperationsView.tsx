// components/views/OperationsView.tsx

"use client";

import { motion } from "framer-motion";
import { LiveMarketPulse } from "./intel/LiveMarketPulse";
import { RecentPredictions } from "./intel/RecentPredictions";

export function OperationsView() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-10">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm pb-6 -mx-4 px-4 pt-4 border-b border-slate-800/50">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />
              <h1 className="text-5xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 mb-3 tracking-tight">
                NEURAL EDGE
              </h1>
              <p className="text-slate-400 text-lg font-light">
              Real-time market intelligence • Neural prediction engine
              </p>
            </div>
          </div>

          {/* Live Market Pulse */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <LiveMarketPulse />
          </motion.div>

          {/* Recent Predictions */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <RecentPredictions />
          </motion.div>
        </div>
      </div>

      {/* Global CSS - No bounce scroll */}
      <style jsx global>{`
        html {
          overflow-y: scroll;
          overscroll-behavior-y: none;
          -webkit-overflow-scrolling: touch;
        }
        
        body {
          overscroll-behavior-y: none;
        }

        /* Hide scrollbar - Cross-browser */
        ::-webkit-scrollbar {
          width: 0px;
          height: 0px;
          background: transparent;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: transparent;
        }

        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}