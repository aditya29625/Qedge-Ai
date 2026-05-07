'use client';

import { useState, useEffect } from 'react';
import { MessageSquareText, Brain, Twitter, Newspaper, TrendingUp, TrendingDown, Minus, Activity, Zap, Globe } from 'lucide-react';
import { generateSentiment } from '@/lib/marketData';
import { SentimentData } from '@/lib/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'BTC', 'ETH'];

const sectorData = [
  { sector: 'Technology', score: 68 },
  { sector: 'Finance', score: 42 },
  { sector: 'Energy', score: -18 },
  { sector: 'Healthcare', score: 55 },
  { sector: 'Consumer', score: 22 },
  { sector: 'Crypto', score: 74 },
  { sector: 'Real Estate', score: -8 },
];

export default function SentimentPage() {
  const [selected, setSelected] = useState('NVDA');
  const [data, setData] = useState<SentimentData | null>(null);
  const [allScores, setAllScores] = useState<{ symbol: string; score: number; label: string }[]>([]);

  useEffect(() => {
    const s = generateSentiment(selected);
    setData(s);
  }, [selected]);

  useEffect(() => {
    setAllScores(SYMBOLS.map(sym => {
      const s = generateSentiment(sym);
      return { symbol: sym, score: Math.round(s.overall * 100), label: s.label };
    }));
  }, []);

  const scoreColor = (v: number) => v > 10 ? '#00ff88' : v < -10 ? '#ff375f' : '#6271f1';
  const labelColor = (l: string) => l.includes('BULL') ? 'text-neon-green' : l.includes('BEAR') ? 'text-neon-red' : 'text-brand-400';

  const radarData = data ? [
    { subject: 'News', A: Math.round((data.newsScore + 1) * 50) },
    { subject: 'Twitter', A: Math.round((data.twitterScore + 1) * 50) },
    { subject: 'Reddit', A: Math.round((data.redditScore + 1) * 50) },
    { subject: 'Inst. Flow', A: Math.round((data.institutionalFlow + 1) * 50) },
    { subject: 'Fear/Greed', A: data.fearGreedIndex },
  ] : [];

  const historyData = Array.from({ length: 14 }, (_, i) => ({
    day: `D-${13 - i}`,
    score: Math.round((Math.random() - 0.4) * 80),
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto content-scroll p-6 gap-6 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={24} className="text-neon-purple" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">NLP Sentiment Engine</h1>
            <p className="text-sm text-text-muted">FinBERT + RoBERTa multi-source sentiment analysis</p>
          </div>
        </div>
        <select
          className="input-glass font-mono font-bold"
          value={selected}
          onChange={e => setSelected(e.target.value)}
        >
          {SYMBOLS.map(s => <option key={s} value={s} className="bg-dark-500">{s}</option>)}
        </select>
      </div>

      {data && (
        <>
          {/* Score Cards */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: <Brain size={18} />, label: 'Overall', val: data.overall, color: '#bf5af2' },
              { icon: <Newspaper size={18} />, label: 'News (FinBERT)', val: data.newsScore, color: '#00d4ff' },
              { icon: <Twitter size={18} />, label: 'Twitter/X', val: data.twitterScore, color: '#1DA1F2' },
              { icon: <MessageSquareText size={18} />, label: 'Reddit (NLP)', val: data.redditScore, color: '#FF4500' },
              { icon: <Activity size={18} />, label: 'Inst. Flow', val: data.institutionalFlow, color: '#ffd60a' },
            ].map(item => (
              <div key={item.label} className="glass rounded-2xl p-4 text-center card-hover">
                <div className="flex justify-center mb-2" style={{ color: item.color }}>{item.icon}</div>
                <div className="text-xs text-text-muted mb-1">{item.label}</div>
                <div className="text-2xl font-black font-mono" style={{ color: scoreColor(item.val * 100) }}>
                  {item.val > 0 ? '+' : ''}{Math.round(item.val * 100)}
                </div>
                <div className="text-xs text-text-muted mt-1">score</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Radar Chart */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Sentiment Radar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="Score" dataKey="A" stroke="#bf5af2" fill="#bf5af2" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 14-day Sentiment History */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">14-Day Sentiment Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#bf5af2" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#bf5af2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[-100, 100]} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(6,6,15,0.95)', border: '1px solid rgba(191,90,242,0.3)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#bf5af2" fill="url(#sentGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Market Heatmap */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><Globe size={14} />Sector Heatmap</h3>
              <div className="space-y-2">
                {sectorData.map(s => (
                  <div key={s.sector} className="flex items-center gap-3">
                    <span className="text-xs text-text-muted w-24 flex-shrink-0">{s.sector}</span>
                    <div className="flex-1 relative h-5 rounded overflow-hidden bg-white/5">
                      <div
                        className="h-full rounded transition-all duration-700"
                        style={{
                          width: `${Math.abs(s.score)}%`,
                          marginLeft: s.score < 0 ? 'auto' : undefined,
                          background: s.score > 0
                            ? `linear-gradient(90deg, rgba(0,255,136,0.3), rgba(0,255,136,0.7))`
                            : `linear-gradient(90deg, rgba(255,55,95,0.7), rgba(255,55,95,0.3))`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold w-10 text-right" style={{ color: scoreColor(s.score) }}>
                      {s.score > 0 ? '+' : ''}{s.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Symbol Comparison + News */}
          <div className="grid grid-cols-2 gap-6">
            {/* All-symbol sentiment */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><Zap size={14} />Multi-Symbol Sentiment</h3>
              <div className="space-y-3">
                {allScores.map(s => (
                  <div key={s.symbol} className="flex items-center gap-3">
                    <button
                      onClick={() => setSelected(s.symbol)}
                      className={`font-mono text-sm font-bold w-14 flex-shrink-0 text-left hover:text-neon-blue transition-colors ${selected === s.symbol ? 'text-neon-blue' : 'text-text-primary'}`}
                    >
                      {s.symbol}
                    </button>
                    <div className="flex-1 relative h-4 bg-white/5 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${Math.abs(s.score)}%`,
                          marginLeft: s.score < 0 ? 'auto' : undefined,
                          background: s.score > 0 ? 'linear-gradient(90deg,rgba(0,255,136,0.3),rgba(0,255,136,0.7))' : 'linear-gradient(90deg,rgba(255,55,95,0.7),rgba(255,55,95,0.3))',
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold w-10 text-right" style={{ color: scoreColor(s.score) }}>
                      {s.score > 0 ? '+' : ''}{s.score}
                    </span>
                    <span className={`text-xs w-24 text-right ${labelColor(s.label)}`}>{s.label.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Headlines */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                <Newspaper size={14} />FinBERT News Analysis — {selected}
              </h3>
              <div className="space-y-4">
                {data.recentHeadlines.map(h => (
                  <div key={h.id} className="flex gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className={`w-1 rounded-full flex-shrink-0 ${h.sentimentLabel === 'POSITIVE' ? 'bg-neon-green' : h.sentimentLabel === 'NEGATIVE' ? 'bg-neon-red' : 'bg-brand-400'}`} />
                    <div>
                      <p className="text-sm text-text-primary leading-snug">{h.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-text-muted">{h.source}</span>
                        <span className={`badge border text-xs ${h.impact === 'HIGH' ? 'bg-red-500/20 text-neon-red border-red-500/30' : h.impact === 'MEDIUM' ? 'bg-yellow-500/20 text-neon-gold border-yellow-500/30' : 'bg-white/10 text-text-muted border-white/10'}`}>{h.impact}</span>
                        <span className={`font-mono text-xs font-bold ${h.sentiment > 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                          {h.sentiment > 0 ? '+' : ''}{h.sentiment.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
