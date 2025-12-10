"use client";

// app/page.tsx

import { AnimatePresence } from "framer-motion";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { NavigationSidebar } from "@/components/navigation/NavigationSidebar";
import { NavigationDrawer } from "@/components/navigation/NavigationDrawer";
import { NeuralProvider } from "@/contexts/NeuralContext";
import { HomeView } from "@/components/views/HomeView";
import { PositionsView } from "@/components/views/PositionsView";
import { MarketsView } from "@/components/views/MarketsView";
import { LeaderboardView } from "@/components/views/LeaderboardView";
import { OperationsView } from "@/components/views/OperationsView";

export default function Page() {
  const { activeView } = useNavigation();

  return (
    <NeuralProvider>
      <>
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <NavigationSidebar />
        </div>

        {/* Mobile Drawer */}
        <div className="md:hidden">
          <NavigationDrawer />
        </div>

        {/* Main Content - proper offset */}
        <main className="md:ml-[100px] pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            {activeView === "home" && <HomeView key="home" />}
            {activeView === "positions" && <PositionsView key="positions" />}
            {activeView === "markets" && <MarketsView key="markets" />}
            {activeView === "leaderboard" && <LeaderboardView key="leaderboard" />}
            {activeView === "neural" && <OperationsView key="neural" />}
          </AnimatePresence>
        </main>
      </>
    </NeuralProvider>
  );
}