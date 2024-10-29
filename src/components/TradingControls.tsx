import React, { useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { useTradingStore } from '../stores/tradingStore';
import { useDerivStore } from '../stores/derivStore';

export default function TradingControls() {
  const { 
    isAutoTrading, 
    setAutoTrading, 
    tradeAmount, 
    setTradeAmount, 
    selectedTimeframe, 
    setTimeframe,
    lastPrice,
    currentTrade,
    setCurrentTrade
  } = useTradingStore();
  
  const { balance, api, selectedSymbol, addTrade } = useDerivStore();

  useEffect(() => {
    if (isAutoTrading && api) {
      const handleTick = async (data: any) => {
        const currentPrice = data.tick.quote;
        
        if (!lastPrice || !currentTrade) {
          // Iniciar primera operación
          const prediction = Math.random() > 0.5 ? 'CALL' : 'PUT';
          try {
            const duration = parseInt(selectedTimeframe);
            const contract = await api.buyContract(selectedSymbol, prediction, tradeAmount, duration);
            
            setCurrentTrade({
              type: prediction,
              entryPrice: currentPrice,
              amount: tradeAmount,
              timestamp: new Date().toISOString(),
              contractId: contract.contract_id
            });

            toast.success(`Nueva operación: ${prediction} - $${tradeAmount}`);
          } catch (error) {
            toast.error('Error al crear operación');
            console.error(error);
          }
        } else {
          // Verificar resultado de operación actual
          if (currentTrade.type === 'CALL' && currentPrice > currentTrade.entryPrice) {
            addTrade({
              id: Date.now(),
              symbol: selectedSymbol,
              type: currentTrade.type,
              amount: currentTrade.amount,
              profit: tradeAmount * 0.95,
              timestamp: new Date().toISOString(),
              aiPrediction: {
                confidence: 85,
                direction: 'up'
              }
            });
            setCurrentTrade(null);
          } else if (currentTrade.type === 'PUT' && currentPrice < currentTrade.entryPrice) {
            addTrade({
              id: Date.now(),
              symbol: selectedSymbol,
              type: currentTrade.type,
              amount: currentTrade.amount,
              profit: tradeAmount * 0.95,
              timestamp: new Date().toISOString(),
              aiPrediction: {
                confidence: 85,
                direction: 'down'
              }
            });
            setCurrentTrade(null);
          }
        }
      };

      api.subscribeToTicks(selectedSymbol, handleTick);
    }
  }, [isAutoTrading, api, selectedSymbol, lastPrice, currentTrade]);

  const handleAutoTrading = () => {
    if (!balance) {
      toast.error('Conecta tu cuenta antes de iniciar el trading automático');
      return;
    }
    
    if (tradeAmount > balance) {
      toast.error('El monto de operación no puede ser mayor al balance');
      return;
    }

    setAutoTrading(!isAutoTrading);
    toast.success(isAutoTrading ? 'Trading automático detenido' : 'Trading automático iniciado');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Control de Trading</h3>
        <button
          onClick={handleAutoTrading}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isAutoTrading
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isAutoTrading ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Detener
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Iniciar
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto por Operación ($)
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeframe
          </label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
          >
            <option value="1m">1 minuto</option>
            <option value="5m">5 minutos</option>
            <option value="15m">15 minutos</option>
            <option value="1h">1 hora</option>
          </select>
        </div>
      </div>
    </div>
  );
}