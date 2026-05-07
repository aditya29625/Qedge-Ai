'use client';

import { useState, useEffect } from 'react';
import { History, Play, TrendingUp, TrendingDown, BarChart3, ShieldCheck, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { generateBacktest } from '@/lib/marketData';
import { BacktestResult } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';

const STRATEGIES = ['Ensemble ML Signal', 'LSTM Trend Follow', 'RSI Mean Reversion', 'MACD Momentum', 'Breakout + Volume', 'RL Agent (PPO)'];
const SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'BTC', 'ETH', 'SPY'];

export default function BacktestPage() {
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [symbol, setSymbol] = useState('NVDA');
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runBacktest = () => {
    setRunning(true);
    setProgress(0);
    setResult(null);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 18;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setResult(generateBacktest(strategy, symbol));
      setRunning(false);
    }, 2400);
  };

  useEffect(() => { runBacktest(); }, []);

  const metricColor = (val: number, goodHigh: boolean) =>
    goodHigh ? (val > 0 ? '#00ff88' : '#ff375f') : (val < 0 ? '#ff375f' : '#00ff88');

  return (
    <div className="flex flex-col h-full overflow-y-auto content-scroll p-6 gap-6 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History size={24} className="text-neon-gold" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Walk-Forward Backtest Engine</h1>
            <p className="text-sm text-text-muted">Time-series cross-validation with strict data-leakage prevention</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass rounded-2xl p-5 flex items-end gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-muted uppercase tracking-wider">Strategy</label>
          <select className="input-glass min-w-[200px]" value={strategy} onChange={e => setStrategy(e.target.value)}>
            {STRATEGIES.map(s => <option key={s} value={s} className="bg-dark-500">{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-muted uppercase tracking-wider">Asset</label>
          <select className="input-glass" value={symbol} onChange={e => setSymbol(e.target.value)}>
            {SYMBOLS.map(s => <option key={s} value={s} className="bg-dark-500">{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-muted uppercase tracking-wider">Period</label>
          <select className="input-glass">
            <option className="bg-dark-500">2023-01-01 → 2024-05-01</option>
            <option className="bg-dark-500">2022-01-01 → 2024-05-01</option>
            <option className="bg-dark-500">2020-01-01 → 2024-05-01</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-text-muted uppercase tracking-wider">Initial Capital</label>
          <input className="input-glass w-36" defaultValue="$100,000" />
        </div>
        <button onClick={runBacktest} disabled={running} className="btn-primary flex items-center gap-2 h-10 px-6 ml-auto">
          <Play size={14} />
          {running ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {/* Progress */}
      {running && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-neon-gold font-medium flex items-center gap-2"><Zap size={12} />Walk-forward validation in progress...</span>
            <span className="font-mono text-text-primary">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="progress-bar h-2">
            <div className="progress-fill h-2" style={{ width: `${Math.min(100, progress)}%`, background: 'linear-gradient(90deg,#ffd60a,#ff9f0a)' }} />
          </div>
        </div>
      )}

      {result && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Return', val: result.totalReturn, unit: '%', goodHigh: true },
              { label: 'Ann. Return', val: result.annualizedReturn, unit: '%', goodHigh: true },
              { label: 'Sharpe Ratio', val: result.sharpeRatio, unit: '', goodHigh: true },
              { label: 'Sortino Ratio', val: result.sortinoRatio, unit: '', goodHigh: true },
              { label: 'Max Drawdown', val: result.maxDrawdown, unit: '%', goodHigh: false },
              { label: 'Win Rate', val: result.winRate, unit: '%', goodHigh: true },
              { label: 'Profit Factor', val: result.profitFactor, unit: 'x', goodHigh: true },
              { label: 'Total Trades', val: result.totalTrades, unit: '', goodHigh: true },
            ].map(m => (
              <div key={m.label} className="glass rounded-xl p-4 card-hover">
                <div className="text-xs text-text-muted mb-1">{m.label}</div>
                <div className="text-xl font-black font-mono" style={{ color: metricColor(m.val, m.goodHigh) }}>
                  {m.val > 0 && m.unit !== '' ? '+' : ''}{m.val.toFixed(m.unit === '' ? 2 : 1)}{m.unit}
                </div>
              </div>
            ))}
          </div>

          {/* Equity Curve */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-neon-green" />Equity Curve — {symbol} / {strategy}
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={result.equityCurve}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(6,6,15,0.95)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, 'Portfolio Value']}
                />
                <ReferenceLine y={100000} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" label={{ value: 'Start $100k', fill: '#64748b', fontSize: 10 }} />
                <Area type="monotone" dataKey="value" stroke="#00ff88" fill="url(#eqGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Trade Distribution */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-neon-blue" />Trade P&amp;L Distribution
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={result.trades.slice(0, 40)} barSize={8}>
                <XAxis hide />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(6,6,15,0.95)', border: '1px solid rgba(98,113,241,0.3)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v.toFixed(2)}%`, 'P&L']}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Bar dataKey="pnlPct">
                  {result.trades.slice(0, 40).map((t, i) => (
                    <Cell key={i} fill={t.pnlPct >= 0 ? 'rgba(0,255,136,0.7)' : 'rgba(255,55,95,0.7)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
