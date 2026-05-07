'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp, TrendingDown, Minus, Search, RefreshCw, Zap, Activity,
  BarChart3, Brain, Eye, ShieldCheck, AlertTriangle, Info,
  ChevronUp, ChevronDown, Target, DollarSign, Cpu, LineChart,
} from 'lucide-react';
import {
  generateOHLCV, computeIndicators, generatePrediction,
  generateSentiment, generateSHAP, generateMarketSnapshots, generateMacroData,
} from '@/lib/marketData';
import { OHLCV, TechnicalIndicators, EnsemblePrediction, SentimentData, SHAPExplanation, MarketSnapshot, MacroData } from '@/lib/types';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBarChart, RadialBar, BarChart, Bar, Cell } from 'recharts';

const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false });

const SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'BTC', 'ETH', 'SPY'];
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

export default function DashboardPage() {
  const [symbol, setSymbol] = useState('NVDA');
  const [timeframe, setTimeframe] = useState('1h');
  const [ohlcv, setOhlcv] = useState<OHLCV[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [prediction, setPrediction] = useState<EnsemblePrediction | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [shap, setShap] = useState<SHAPExplanation[]>([]);
  const [snapshots, setSnapshots] = useState<MarketSnapshot[]>([]);
  const [macro, setMacro] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'shap' | 'sentiment' | 'macro'>('overview');
  const [livePrice, setLivePrice] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const loadData = useCallback(() => {
    setLoading(true);
    const data = generateOHLCV(symbol, 200);
    const ind = computeIndicators(data);
    const pred = generatePrediction(symbol, data, ind);
    const sent = generateSentiment(symbol);
    const shapVals = generateSHAP(ind, pred);
    setOhlcv(data);
    setIndicators(ind);
    setPrediction(pred);
    setSentiment(sent);
    setShap(shapVals);
    setLivePrice(data[data.length - 1].close);
    setLoading(false);
  }, [symbol]);

  useEffect(() => {
    setSnapshots(generateMarketSnapshots());
    setMacro(generateMacroData());
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Live price tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setLivePrice(p => +(p * (1 + (Math.random() - 0.496) * 0.002)).toFixed(2));
    }, 1800);
    return () => clearInterval(intervalRef.current);
  }, []);

  const dirColor = prediction?.direction === 'UP' ? 'text-neon-green' : prediction?.direction === 'DOWN' ? 'text-neon-red' : 'text-brand-400';
  const dirBg = prediction?.direction === 'UP' ? 'from-green-500/10 to-green-500/5 border-green-500/30' : prediction?.direction === 'DOWN' ? 'from-red-500/10 to-red-500/5 border-red-500/30' : 'from-brand-500/10 to-brand-500/5 border-brand-500/30';
  const dirIcon = prediction?.direction === 'UP' ? <TrendingUp size={28} /> : prediction?.direction === 'DOWN' ? <TrendingDown size={28} /> : <Minus size={28} />;

  return (
    <div className="flex flex-col h-full overflow-hidden relative z-10">
      {/* Top Bar */}
      <header className="glass border-b border-white/5 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        {/* Symbol selector */}
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
          <Search size={16} className="text-text-muted" />
          <select
            className="bg-transparent text-text-primary text-sm font-mono font-bold outline-none cursor-pointer"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          >
            {SYMBOLS.map(s => <option key={s} value={s} className="bg-dark-500">{s}</option>)}
          </select>
        </div>

        {/* Live Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            ${livePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-sm font-semibold ${(prediction?.expectedMove ?? 0) >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
            {(prediction?.expectedMove ?? 0) >= 0 ? '+' : ''}{prediction?.expectedMove?.toFixed(2)}%
          </span>
        </div>

        {/* Timeframe */}
        <div className="flex gap-1 ml-auto">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${timeframe === tf ? 'bg-brand-600/30 text-neon-blue border border-brand-500/40' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
            >
              {tf}
            </button>
          ))}
        </div>

        <button onClick={loadData} className="btn-ghost flex items-center gap-2 ml-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs">Refresh</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="live-dot"></div>
          <span className="text-xs text-neon-green font-mono">LIVE</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Candlestick Chart */}
          <div className="glass m-3 mb-0 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
            <TradingChart data={ohlcv} symbol={symbol} timeframe={timeframe as any} height={320} />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3 mt-3 flex-shrink-0">
            {(['overview', 'models', 'shap', 'sentiment', 'macro'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all capitalize ${activeTab === tab ? 'bg-brand-600/25 text-neon-blue border border-brand-500/30' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto content-scroll p-3 pt-2">
            {activeTab === 'overview' && indicators && (
              <div className="grid grid-cols-3 gap-3">
                {/* Indicators grid */}
                {[
                  { label: 'RSI (14)', val: indicators.rsi, unit: '', color: indicators.rsi > 70 ? '#ff375f' : indicators.rsi < 30 ? '#00ff88' : '#6271f1' },
                  { label: 'MACD', val: indicators.macd, unit: '', color: indicators.macd > 0 ? '#00ff88' : '#ff375f' },
                  { label: 'ATR', val: indicators.atr, unit: '', color: '#bf5af2' },
                  { label: 'ADX', val: indicators.adx, unit: '', color: indicators.adx > 25 ? '#ffd60a' : '#64748b' },
                  { label: 'EMA 50', val: indicators.ema50, unit: '$', color: '#6271f1' },
                  { label: 'VWAP', val: indicators.vwap, unit: '$', color: '#00d4ff' },
                  { label: 'BB Upper', val: indicators.bbUpper, unit: '$', color: '#ff9f0a' },
                  { label: 'BB Lower', val: indicators.bbLower, unit: '$', color: '#ff9f0a' },
                  { label: 'Stoch %K', val: indicators.stochK, unit: '', color: '#bf5af2' },
                ].map(ind => (
                  <div key={ind.label} className="glass rounded-xl p-3 card-hover">
                    <div className="text-xs text-text-muted mb-1">{ind.label}</div>
                    <div className="font-mono font-bold text-base" style={{ color: ind.color }}>
                      {ind.unit}{typeof ind.val === 'number' ? ind.val.toFixed(2) : ind.val}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'models' && prediction && (
              <div className="space-y-2">
                {prediction.models.map(m => (
                  <div key={m.modelName} className="glass rounded-xl p-4 flex items-center gap-4">
                    <div className="w-32 flex-shrink-0">
                      <div className="text-sm font-bold text-text-primary">{m.modelName}</div>
                      <div className="text-xs font-mono text-text-muted mt-0.5">{m.modelType}</div>
                    </div>
                    <div className={`badge flex-shrink-0 ${m.direction === 'UP' ? 'bg-green-500/20 text-neon-green border border-green-500/30' : m.direction === 'DOWN' ? 'bg-red-500/20 text-neon-red border border-red-500/30' : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'}`}>
                      {m.direction === 'UP' ? <ChevronUp size={12} /> : m.direction === 'DOWN' ? <ChevronDown size={12} /> : <Minus size={12} />}
                      {m.direction}
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${m.confidence}%`, background: m.confidence > 70 ? 'linear-gradient(90deg, #00ff88, #00d4ff)' : 'linear-gradient(90deg, #ffd60a, #ff9f0a)' }} />
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-text-primary w-12 text-right">{m.confidence.toFixed(0)}%</div>
                    <div className="text-xs text-text-muted w-16 text-right">w={m.weight.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'shap' && (
              <div className="space-y-2">
                <p className="text-xs text-text-muted mb-3">SHAP feature contributions — explainable AI decomposition of ensemble prediction</p>
                {shap.map(s => (
                  <div key={s.feature} className="glass rounded-xl p-3 flex items-center gap-3">
                    <div className="w-36 flex-shrink-0 text-sm font-medium text-text-primary">{s.feature}</div>
                    <div className="flex-1 relative h-4 flex items-center">
                      <div className="absolute left-1/2 w-px h-4 bg-white/10" />
                      {s.contribution > 0 ? (
                        <div className="absolute left-1/2 shap-bar-positive h-3 rounded-sm" style={{ width: `${Math.abs(s.contribution) * 300}px` }} />
                      ) : (
                        <div className="absolute right-1/2 shap-bar-negative h-3 rounded-sm" style={{ width: `${Math.abs(s.contribution) * 300}px` }} />
                      )}
                    </div>
                    <div className={`font-mono text-sm font-bold w-16 text-right ${s.contribution > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {s.contribution > 0 ? '+' : ''}{s.contribution.toFixed(3)}
                    </div>
                    <div className={`badge text-xs w-24 flex-shrink-0 ${
                      s.category === 'TECHNICAL' ? 'bg-blue-500/20 text-blue-300' :
                      s.category === 'SENTIMENT' ? 'bg-purple-500/20 text-purple-300' :
                      s.category === 'MACRO' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>{s.category}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'sentiment' && sentiment && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Overall', val: sentiment.overall, icon: <Brain size={16} /> },
                    { label: 'News', val: sentiment.newsScore, icon: <Activity size={16} /> },
                    { label: 'Twitter/X', val: sentiment.twitterScore, icon: <Zap size={16} /> },
                    { label: 'Reddit', val: sentiment.redditScore, icon: <BarChart3 size={16} /> },
                  ].map(s => (
                    <div key={s.label} className="glass rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-muted mb-2">{s.icon}<span className="text-xs">{s.label}</span></div>
                      <div className={`text-2xl font-bold font-mono ${s.val > 0.1 ? 'text-neon-green' : s.val < -0.1 ? 'text-neon-red' : 'text-brand-400'}`}>
                        {s.val > 0 ? '+' : ''}{(s.val * 100).toFixed(0)}
                      </div>
                      <div className="text-xs text-text-muted mt-1">score</div>
                    </div>
                  ))}
                </div>
                <div className="glass rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><Activity size={14} />Recent Headlines</h3>
                  <div className="space-y-3">
                    {sentiment.recentHeadlines.slice(0, 4).map(h => (
                      <div key={h.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                        <span className={`badge flex-shrink-0 mt-0.5 ${h.sentimentLabel === 'POSITIVE' ? 'bg-green-500/20 text-neon-green border border-green-500/30' : h.sentimentLabel === 'NEGATIVE' ? 'bg-red-500/20 text-neon-red border border-red-500/30' : 'bg-white/10 text-text-muted border border-white/10'}`}>
                          {h.sentimentLabel === 'POSITIVE' ? '+' : h.sentimentLabel === 'NEGATIVE' ? '-' : '~'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary leading-snug line-clamp-2">{h.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-text-muted">{h.source}</span>
                            <span className={`badge text-xs ${h.impact === 'HIGH' ? 'bg-red-500/20 text-red-300 border-red-500/30' : h.impact === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-white/10 text-text-muted border-white/10'} border`}>{h.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'macro' && macro && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'VIX', val: macro.vix, unit: '', desc: 'Fear Index' },
                  { label: 'DXY', val: macro.dxy, unit: '', desc: 'US Dollar Index' },
                  { label: 'S&P 500', val: macro.sp500, unit: '$', desc: 'US Large Cap' },
                  { label: '10Y Yield', val: macro.tenYearYield, unit: '', desc: 'Treasury Bond %' },
                  { label: 'Fed Rate', val: macro.fedFundsRate, unit: '', desc: 'Federal Funds Rate %' },
                  { label: 'Inflation', val: macro.inflationRate, unit: '', desc: 'CPI Rate %' },
                  { label: 'GDP Growth', val: macro.gdpGrowth, unit: '', desc: 'Annualized %' },
                  { label: 'Unemployment', val: macro.unemploymentRate, unit: '', desc: 'Rate %' },
                  { label: 'Gold', val: macro.goldUSD, unit: '$', desc: 'USD/oz' },
                ].map(m => (
                  <div key={m.label} className="glass rounded-xl p-4 card-hover">
                    <div className="text-xs text-text-muted mb-1">{m.desc}</div>
                    <div className="text-lg font-bold font-mono text-neon-blue">{m.unit}{m.val.toFixed(2)}</div>
                    <div className="text-xs font-semibold text-text-secondary mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <aside className="w-80 flex flex-col border-l border-white/5 overflow-y-auto content-scroll p-4 gap-4 flex-shrink-0">
          {/* AI Signal Card */}
          {prediction && (
            <div className={`glass rounded-2xl p-5 bg-gradient-to-br ${dirBg} border`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-neon-blue" />
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">AI Signal</span>
                </div>
                <span className={`badge border ${dirBg} ${dirColor} text-sm font-bold`}>{prediction.signal}</span>
              </div>

              {/* Direction */}
              <div className={`flex items-center gap-3 mb-4 ${dirColor}`}>
                {dirIcon}
                <div>
                  <div className="text-3xl font-black">{prediction.direction}</div>
                  <div className="text-xs text-text-muted">Ensemble Consensus</div>
                </div>
              </div>

              {/* Confidence Ring */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full confidence-ring">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <circle
                      cx="40" cy="40" r="32" fill="none"
                      stroke={prediction.direction === 'UP' ? '#00ff88' : prediction.direction === 'DOWN' ? '#ff375f' : '#6271f1'}
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - prediction.confidence / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black font-mono text-white">{prediction.confidence.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Expected Move</span>
                    <span className={`font-mono font-bold ${prediction.expectedMove > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {prediction.expectedMove > 0 ? '+' : ''}{prediction.expectedMove}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Breakout Prob.</span>
                    <span className="font-mono font-bold text-neon-gold">{prediction.breakoutProbability}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Volatility Est.</span>
                    <span className="font-mono font-bold text-neon-purple">{prediction.volatilityEstimate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Regime</span>
                    <span className="font-mono font-bold text-brand-300">{prediction.marketRegime}</span>
                  </div>
                </div>
              </div>

              {/* TP / SL */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                  <span className="text-xs text-text-muted flex items-center gap-1"><ShieldCheck size={12} />Stop Loss</span>
                  <span className="font-mono text-sm font-bold text-neon-red">${prediction.stopLoss.toFixed(2)}</span>
                </div>
                {prediction.takeProfitTargets.map((tp, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-t border-white/5">
                    <span className="text-xs text-text-muted flex items-center gap-1"><Target size={12} />TP {i + 1}</span>
                    <span className="font-mono text-sm font-bold text-neon-green">${tp.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Watch */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><LineChart size={14} />Market Watch</h3>
            <div className="space-y-2">
              {snapshots.slice(0, 6).map(s => (
                <button
                  key={s.symbol}
                  onClick={() => setSymbol(s.symbol)}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all hover:bg-white/5 ${symbol === s.symbol ? 'bg-brand-600/15 border border-brand-500/20' : ''}`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-text-primary font-mono">{s.symbol}</span>
                    <span className="text-xs text-text-muted">{s.name.substring(0, 14)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono font-bold text-text-primary">${s.price.toLocaleString()}</span>
                    <span className={`text-xs font-mono font-bold ${s.changePct >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Alert */}
          <div className="glass rounded-2xl p-4 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-neon-gold" />
              <span className="text-xs font-semibold text-neon-gold uppercase tracking-wider">Risk Disclaimer</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              AI predictions are probabilistic estimates, not financial advice. Markets are stochastic. Always use proper position sizing and risk management. Past model performance does not guarantee future results.
            </p>
          </div>

          {/* Model Architecture */}
          <div className="glass rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2"><Cpu size={14} />Active Models</h3>
            <div className="flex flex-wrap gap-1.5">
              {['LSTM-256', 'GRU-128', 'TFT', 'XGBoost', 'LightGBM', 'CatBoost', 'ViT-Chart', 'FinBERT', 'PPO-RL'].map(m => (
                <span key={m} className="model-badge bg-brand-500/15 text-brand-300 border border-brand-500/25">{m}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
