import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { useDerivStore } from '../stores/derivStore';
import { useTradingStore } from '../stores/tradingStore';

interface AISignal {
  symbol: string;
  direction: 'up' | 'down';
  confidence: number;
  timestamp: string;
  message: string;
  timeframe: string;
}

export default function AISignals() {
  const { selectedSymbol } = useDerivStore();
  const { selectedTimeframe, isAutoTrading } = useTradingStore();
  const [signals, setSignals] = useState<AISignal[]>([]);

  useEffect(() => {
    // Simular predicciones de IA
    const generatePrediction = () => {
      const confidence = Math.floor(Math.random() * 15) + 85; // 85-99%
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      const messages = [
        'Fuerte formación de tendencia detectada',
        'Patrón sugiere posible reversión',
        'Momentum del mercado indica continuación',
        'Análisis de volumen respalda dirección',
        'Indicadores técnicos alineados para movimiento',
        'Patrón armónico identificado',
        'Divergencia detectada en RSI',
        'Cruce de medias móviles confirmado',
      ];

      return {
        symbol: selectedSymbol,
        direction,
        confidence,
        timestamp: new Date().toISOString(),
        message: messages[Math.floor(Math.random() * messages.length)],
        timeframe: selectedTimeframe,
      };
    };

    setSignals([generatePrediction(), generatePrediction()]);

    if (isAutoTrading) {
      const interval = setInterval(() => {
        setSignals((prev) => [generatePrediction(), ...prev].slice(0, 5));
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [selectedSymbol, selectedTimeframe, isAutoTrading]);

  return (
    <div className="space-y-4">
      {signals.map((signal, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-indigo-600 mr-2" />
              <div>
                <p className="font-medium">{signal.symbol}</p>
                <p className="text-sm text-gray-500">
                  Confianza: {signal.confidence}%
                </p>
              </div>
            </div>
            <div className="flex items-center">
              {signal.direction === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">{signal.message}</p>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Timeframe: {signal.timeframe}</span>
            <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}