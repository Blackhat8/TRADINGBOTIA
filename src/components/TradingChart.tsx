import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useDerivStore } from '../stores/derivStore';
import { toast } from 'sonner';

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { selectedSymbol, api } = useDerivStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f3fa' },
        horzLines: { color: '#f0f3fa' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!api || !candlestickSeriesRef.current) return;

      setIsLoading(true);
      try {
        const candles = await api.ticks_history(selectedSymbol, {
          adjust_start_time: 1,
          count: 1000,
          end: 'latest',
          start: 1,
          style: 'candles',
        });

        const formattedData = candles.candles.map((candle: any) => ({
          time: candle.epoch,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        candlestickSeriesRef.current.setData(formattedData);

        // Subscribe to real-time updates
        api.subscribe({ ticks_history: selectedSymbol, style: 'candles', granularity: 60 })
          .forEach((tick: any) => {
            if (candlestickSeriesRef.current) {
              candlestickSeriesRef.current.update({
                time: tick.epoch,
                open: tick.open,
                high: tick.high,
                low: tick.low,
                close: tick.close,
              });
            }
          });
      } catch (error) {
        console.error('Error al cargar datos del gráfico:', error);
        toast.error('Error al cargar datos del gráfico');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedSymbol, api]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      <div ref={chartContainerRef} />
    </div>
  );
}