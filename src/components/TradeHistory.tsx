import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDerivStore } from '../stores/derivStore';

export default function TradeHistory() {
  const { trades } = useDerivStore();

  return (
    <div className="space-y-4">
      {trades.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No hay operaciones aún</p>
      ) : (
        trades.map((trade) => (
          <div key={trade.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{trade.symbol}</p>
                <p className="text-sm text-gray-500">
                  {trade.type} - ${trade.amount}
                </p>
              </div>
              <div className="flex items-center">
                {trade.profit > 0 ? (
                  <div className="flex items-center text-green-500">
                    <CheckCircle className="h-5 w-5 mr-1" />
                    +${trade.profit}
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <XCircle className="h-5 w-5 mr-1" />
                    ${trade.profit}
                  </div>
                )}
              </div>
            </div>
            {trade.aiPrediction && (
              <div className="text-xs text-gray-500">
                Predicción IA: {trade.aiPrediction.confidence}% confianza para {trade.aiPrediction.direction === 'up' ? 'subida' : 'bajada'}
              </div>
            )}
            <p className="text-xs text-gray-400">
              {new Date(trade.timestamp).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}