import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, History, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { useDerivStore } from '../stores/derivStore';
import { useTradingStore } from '../stores/tradingStore';
import TradingChart from '../components/TradingChart';
import AISignals from '../components/AISignals';
import TradeHistory from '../components/TradeHistory';
import TradingControls from '../components/TradingControls';

export default function Dashboard() {
  const { 
    balance, 
    connectDeriv, 
    selectedSymbol, 
    setSelectedSymbol,
    token: savedToken,
    isConnected,
    trades,
  } = useDerivStore();

  const { isAutoTrading } = useTradingStore();
  const [token, setToken] = useState(savedToken || '');

  const symbols = [
    { id: 'R_10', name: 'Volatilidad 10 Índice' },
    { id: 'R_25', name: 'Volatilidad 25 Índice' },
    { id: 'R_50', name: 'Volatilidad 50 Índice' },
    { id: 'R_75', name: 'Volatilidad 75 Índice' },
    { id: 'R_100', name: 'Volatilidad 100 Índice' },
  ];

  useEffect(() => {
    if (savedToken && !isConnected) {
      connectDeriv(savedToken).catch(() => {
        toast.error('Error al reconectar. Por favor verifica tu token API.');
      });
    }
  }, [savedToken, isConnected, connectDeriv]);

  const handleConnect = async () => {
    if (!token) {
      toast.error('Por favor ingresa tu token API');
      return;
    }
    try {
      await connectDeriv(token);
      toast.success('Conexión exitosa con Deriv');
    } catch (error) {
      toast.error('Error al conectar. Por favor verifica tu token API.');
    }
  };

  const profitStats = trades.reduce(
    (acc, trade) => {
      if (trade.profit > 0) acc.wins++;
      else acc.losses++;
      acc.total += trade.profit;
      return acc;
    },
    { wins: 0, losses: 0, total: 0 }
  );

  const winRate = trades.length > 0 ? ((profitStats.wins / trades.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Saldo de Cuenta</p>
              <h3 className="text-2xl font-bold">${balance?.toFixed(2) || '0.00'}</h3>
            </div>
            <Wallet className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Precisión IA</p>
              <h3 className="text-2xl font-bold">87.5%</h3>
            </div>
            <Brain className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Operaciones</p>
              <h3 className="text-2xl font-bold">{trades.length}</h3>
            </div>
            <History className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Tasa de Éxito</p>
              <h3 className="text-2xl font-bold">{winRate}%</h3>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {!isConnected && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Conecta tu Cuenta Deriv</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Ingresa tu token API"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
            <button
              onClick={handleConnect}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Conectar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Gráfico de Precios</h3>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              >
                {symbols.map((symbol) => (
                  <option key={symbol.id} value={symbol.id}>
                    {symbol.name}
                  </option>
                ))}
              </select>
            </div>
            <TradingChart />
          </div>

          <TradingControls />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Señales IA</h3>
            <AISignals />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Operaciones Recientes</h3>
            <TradeHistory />
          </div>
        </div>
      </div>
    </div>
  );
}