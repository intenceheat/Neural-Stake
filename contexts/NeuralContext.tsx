// contexts/NeuralContext.tsx

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MarketCard {
  token: string;
  price: number;
  change24h: number;
  prediction: string;
  confidence: number;
  timestamp: string;
}

interface NeuralContextType {
  marketData: MarketCard[];
  isLoading: boolean;
  lastUpdate: Date | null;
  fetchData: () => Promise<void>;
}

const NeuralContext = createContext<NeuralContextType | undefined>(undefined);

export function NeuralProvider({ children }: { children: ReactNode }) {
  const [marketData, setMarketData] = useState<MarketCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDFLARE_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: 'market-pulse' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Parse the nested json strings from Make.com
      const parsedData = data.map((item: any) => JSON.parse(item.json));
      setMarketData(parsedData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeuralContext.Provider value={{ marketData, isLoading, lastUpdate, fetchData }}>
      {children}
    </NeuralContext.Provider>
  );
}

export function useNeural() {
  const context = useContext(NeuralContext);
  if (!context) {
    throw new Error("useNeural must be used within NeuralProvider");
  }
  return context;
}