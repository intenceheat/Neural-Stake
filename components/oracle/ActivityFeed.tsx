"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Activity {
  id: string;
  wallet: string;
  outcome: "YES" | "NO";
  amount: number;
  reputation: number;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 5 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const getReputationTier = (rep: number) => {
    if (rep >= 2.3) return { label: "Oracle", color: "text-purple-400" };
    if (rep >= 2.0) return { label: "Master", color: "text-blue-400" };
    if (rep >= 1.7) return { label: "Expert", color: "text-emerald-400" };
    if (rep >= 1.3) return { label: "Veteran", color: "text-amber-400" };
    return { label: "Novice", color: "text-slate-400" };
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-orbitron font-bold text-white uppercase tracking-wider">
        Recent Activity
      </h3>

      <div className="space-y-2">
        {displayActivities.map((activity, index) => {
          const tier = getReputationTier(activity.reputation);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
            >
              {/* Outcome Indicator */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.outcome === "YES" ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}
              >
                {activity.outcome === "YES" ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>

              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-slate-300">
                    {formatWallet(activity.wallet)}
                  </span>
                  <span className={`text-xs font-bold ${tier.color}`}>
                    {tier.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Staked{" "}
                  <span className="text-amber-400 font-bold font-mono">
                    {activity.amount} SOL
                  </span>{" "}
                  on{" "}
                  <span
                    className={`font-bold ${
                      activity.outcome === "YES" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {activity.outcome}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="text-xs text-slate-600 font-mono">
                {activity.timestamp}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}