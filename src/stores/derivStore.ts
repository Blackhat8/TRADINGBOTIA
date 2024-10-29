import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DerivAPI } from '../utils/deriv';
import { toast } from 'sonner';

interface Trade {
  id: number;
  symbol: string;
  type: 'CALL' | 'PUT';
  amount: number;
  profit: number;
  timestamp: string;
  aiPrediction?: {
    confidence: number;
    direction: 'up' | 'down';
  };
}

interface DerivState {
  api: DerivAPI | null;
  token: string | null;
  balance: number | null;
  selectedSymbol: string;
  trades: Trade[];
  isConnected: boolean;
  connectDeriv: (token: string) => Promise<void>;
  setSelectedSymbol: (symbol: string) => void;
  addTrade: (trade: Trade) => void;
  disconnect: () => void;
}

export const useDerivStore = create<DerivState>()(
  persist(
    (set, get) => ({
      api: null,
      token: null,
      balance: null,
      selectedSymbol: 'R_10',
      trades: [],
      isConnected: false,
      connectDeriv: async (token) => {
        try {
          const api = new DerivAPI(token);
          await api.connect();
          const balance = await api.getBalance();
          
          set({ 
            api,
            token,
            balance,
            isConnected: true,
          });

          toast.success('Successfully connected to Deriv');
        } catch (error) {
          console.error('Failed to connect to Deriv:', error);
          toast.error('Failed to connect to Deriv. Please check your API token.');
          throw error;
        }
      },
      disconnect: () => {
        const { api } = get();
        if (api) {
          api.disconnect();
        }
        set({ 
          api: null, 
          token: null, 
          balance: null, 
          isConnected: false,
          trades: [] 
        });
      },
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
      addTrade: (trade) => set((state) => ({ 
        trades: [trade, ...state.trades].slice(0, 100) 
      })),
    }),
    {
      name: 'deriv-storage',
      partialize: (state) => ({ 
        token: state.token,
        selectedSymbol: state.selectedSymbol,
        trades: state.trades 
      }),
    }
  )
);