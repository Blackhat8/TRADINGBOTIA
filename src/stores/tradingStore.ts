import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TradingState {
  isAutoTrading: boolean;
  setAutoTrading: (status: boolean) => void;
  selectedTimeframe: '1m' | '5m' | '15m' | '1h';
  setTimeframe: (timeframe: '1m' | '5m' | '15m' | '1h') => void;
  tradeAmount: number;
  setTradeAmount: (amount: number) => void;
  lastPrice: number | null;
  setLastPrice: (price: number) => void;
  currentTrade: {
    type: 'CALL' | 'PUT' | null;
    entryPrice: number | null;
    amount: number;
    timestamp: string;
  } | null;
  setCurrentTrade: (trade: any) => void;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      isAutoTrading: false,
      setAutoTrading: (status) => set({ isAutoTrading: status }),
      selectedTimeframe: '5m',
      setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
      tradeAmount: 10,
      setTradeAmount: (amount) => set({ tradeAmount: amount }),
      lastPrice: null,
      setLastPrice: (price) => set({ lastPrice: price }),
      currentTrade: null,
      setCurrentTrade: (trade) => set({ currentTrade: trade }),
    }),
    {
      name: 'trading-storage',
    }
  )
);