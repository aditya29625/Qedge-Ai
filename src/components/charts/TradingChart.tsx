'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { OHLCV, Timeframe } from '@/lib/types';

interface TradingChartProps {
  data: OHLCV[];
  symbol: string;
  timeframe: Timeframe;
  height?: number;
}

export default function TradingChart({ data, symbol, timeframe, height = 500 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        autoScale: true,
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: {
          color: 'rgba(98, 113, 241, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#6271f1',
        },
        horzLine: {
          color: 'rgba(98, 113, 241, 0.5)',
          width: 1,
          style: 3,
          labelBackgroundColor: '#6271f1',
        },
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff375f',
      borderVisible: false,
      wickUpColor: '#00ff88',
      wickDownColor: '#ff375f',
    });
    
    seriesRef.current = candlestickSeries;

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay
    });
    
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart height
        bottom: 0,
      },
    });
    
    volumeSeriesRef.current = volumeSeries;

    // Format data for lightweight-charts
    if (data && data.length > 0) {
      const formattedData = data.map(item => ({
        time: (item.time / 1000) as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      
      const formattedVolume = data.map(item => ({
        time: (item.time / 1000) as Time,
        value: item.volume,
        color: item.close >= item.open ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 55, 95, 0.3)'
      }));

      candlestickSeries.setData(formattedData);
      volumeSeries.setData(formattedVolume);
      
      // Auto scale to fit data
      chart.timeScale().fitContent();
    }

    setIsLoaded(true);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, height]);

  return (
    <div className="relative w-full h-full">
      {/* Header overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-end gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-white">{symbol}</h2>
          <span className="text-text-muted font-mono text-sm mb-1">{timeframe}</span>
        </div>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full" 
        style={{ height: `${height}px` }} 
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-500/50 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center">
            <div className="pulse-dot mb-4"></div>
            <p className="text-sm text-neon-blue font-mono">Initializing Neural Engine...</p>
          </div>
        </div>
      )}
    </div>
  );
}
