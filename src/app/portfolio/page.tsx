'use client';

import { useState, useEffect, useRef } from 'react';
import { LineChart, TrendingUp, TrendingDown, DollarSign, Plus, Trash2, RefreshCw, ShieldCheck } from 'lucide-react';
import { generateOHLCV, computeIndicators, generatePrediction } from '@/lib/marketData';
import { EnsemblePrediction } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6271f1','#00d4ff','#00ff88','#bf5af2','#ffd60a','#ff9f0a','#ff375f'];

interface Position {
  symbol: string; shares: number; entry: number; current: number;
  pnl: number; pnlPct: number; signal: string; confidence: number;
}

const initPositions: Position[] = [
  { symbol: 'NVDA', shares: 10, entry: 790.00, current: 820.50, pnl: 305.00, pnlPct: 3.86, signal: 'STRONG_BUY', confidence: 88 },
  { symbol: 'AAPL', shares: 25, entry: 182.00, current: 178.20, pnl: -95.00, pnlPct: -2.09, signal: 'HOLD', confidence: 61 },
  { symbol: 'TSLA', shares: 15, entry: 238.00, current: 245.80, pnl: 117.00, pnlPct: 3.28, signal: 'BUY', confidence: 74 },
  { symbol: 'BTC', shares: 0.5, entry: 65000, current: 68200, pnl: 1600.00, pnlPct: 4.92, signal: 'STRONG_BUY', confidence: 83 },
  { symbol: 'MSFT', shares: 8, entry: 420.00, current: 415.30, pnl: -37.60, pnlPct: -1.12, signal: 'HOLD', confidence: 58 },
];

export default function PortfolioPage() {
  const [positions, setPositions] = useState<Position[]>(initPositions);
  const [cash, setCash] = useState(28_450.00);
  const [equityCurve, setEquityCurve] = useState<{time:string;value:number}[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const totalValue = positions.reduce((a, p) => a + p.current * p.shares, 0) + cash;
  const totalPnL = positions.reduce((a, p) => a + p.pnl, 0);
  const totalPnLPct = (totalPnL / (totalValue - totalPnL)) * 100;

  // Build equity curve
  useEffect(() => {
    const base = totalValue * 0.88;
    setEquityCurve(Array.from({ length: 30 }, (_, i) => ({
      time: `D-${29-i}`,
      value: +(base + (base * 0.12 * i / 30) + (Math.random() - 0.4) * base * 0.02).toFixed(2),
    })));
  }, []);

  // Live price tick
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPositions(ps => ps.map(p => {
        const newCurrent = +(p.current * (1 + (Math.random() - 0.497) * 0.003)).toFixed(2);
        const newPnl = +((newCurrent - p.entry) * p.shares).toFixed(2);
        return { ...p, current: newCurrent, pnl: newPnl, pnlPct: +((newCurrent - p.entry) / p.entry * 100).toFixed(2) };
      }));
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const signalColor = (s: string) =>
    s.includes('STRONG_BUY') ? 'text-neon-green bg-green-500/20 border-green-500/30' :
    s.includes('BUY') ? 'text-green-400 bg-green-500/15 border-green-500/25' :
    s.includes('STRONG_SELL') ? 'text-neon-red bg-red-500/20 border-red-500/30' :
    s.includes('SELL') ? 'text-red-400 bg-red-500/15 border-red-500/25' :
    'text-brand-300 bg-brand-500/15 border-brand-500/25';

  const allocationData = positions.map((p, i) => ({
    name: p.symbol, value: +(p.current * p.shares).toFixed(0), color: COLORS[i],
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto content-scroll p-6 gap-6 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LineChart size={24} className="text-neon-green" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Paper Trading Portfolio</h1>
            <p className="text-sm text-text-muted">AI-powered position management with live signals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="text-xs text-neon-green font-mono">LIVE PAPER</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', val: `$${totalValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: '#00d4ff', icon: <DollarSign size={18}/> },
          { label: 'Total P&L', val: `${totalPnL>=0?'+':''}$${totalPnL.toFixed(2)}`, color: totalPnL>=0?'#00ff88':'#ff375f', icon: totalPnL>=0?<TrendingUp size={18}/>:<TrendingDown size={18}/> },
          { label: 'Return %', val: `${totalPnLPct>=0?'+':''}${totalPnLPct.toFixed(2)}%`, color: totalPnLPct>=0?'#00ff88':'#ff375f', icon: <TrendingUp size={18}/> },
          { label: 'Cash Available', val: `$${cash.toLocaleString('en-US',{minimumFractionDigits:2})}`, color: '#ffd60a', icon: <ShieldCheck size={18}/> },
        ].map(m => (
          <div key={m.label} className="glass rounded-2xl p-5 card-hover">
            <div className="flex items-center gap-2 mb-2" style={{ color: m.color }}>{m.icon}<span className="text-xs text-text-muted">{m.label}</span></div>
            <div className="text-2xl font-black font-mono" style={{ color: m.color }}>{m.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Equity Curve */}
        <div className="col-span-2 glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">30-Day Equity Curve</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={equityCurve}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill:'#64748b', fontSize:10 }} interval={4}/>
              <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip contentStyle={{ background:'rgba(6,6,15,0.95)', border:'1px solid rgba(0,212,255,0.25)', borderRadius:8, fontSize:12 }}
                formatter={(v:number)=>[`$${v.toLocaleString()}`,'Value']}/>
              <Area type="monotone" dataKey="value" stroke="#00d4ff" fill="url(#portGrad)" strokeWidth={2} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Allocation</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{ background:'rgba(6,6,15,0.95)', border:'1px solid rgba(98,113,241,0.3)', borderRadius:8, fontSize:12 }}
                formatter={(v:number)=>[`$${v.toLocaleString()}`]}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {allocationData.map((d,i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i%COLORS.length] }}/>
                  <span className="font-mono font-bold text-text-primary">{d.name}</span>
                </div>
                <span className="text-text-muted">${d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Open Positions</h3>
          <div className="flex items-center gap-3">
            <input className="input-glass text-xs h-8 w-24" placeholder="Symbol" value={newSymbol} onChange={e=>setNewSymbol(e.target.value.toUpperCase())}/>
            <input className="input-glass text-xs h-8 w-20" placeholder="Shares" value={newShares} onChange={e=>setNewShares(e.target.value)}/>
            <button className="btn-primary h-8 text-xs flex items-center gap-1"><Plus size={12}/>Add</button>
          </div>
        </div>
        <table className="w-full data-table">
          <thead>
            <tr>
              {['Symbol','Shares','Entry','Current','P&L','P&L %','AI Signal','Confidence','Action'].map(h=>(
                <th key={h} className="text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map(p => (
              <tr key={p.symbol}>
                <td className="font-mono font-bold text-text-primary">{p.symbol}</td>
                <td className="font-mono text-text-secondary">{p.shares}</td>
                <td className="font-mono text-text-muted">${p.entry.toLocaleString()}</td>
                <td className="font-mono font-bold text-text-primary">${p.current.toLocaleString()}</td>
                <td className={`font-mono font-bold ${p.pnl>=0?'text-neon-green':'text-neon-red'}`}>
                  {p.pnl>=0?'+':''}{p.pnl.toFixed(2)}
                </td>
                <td className={`font-mono font-bold ${p.pnlPct>=0?'text-neon-green':'text-neon-red'}`}>
                  {p.pnlPct>=0?'+':''}{p.pnlPct.toFixed(2)}%
                </td>
                <td><span className={`badge border text-xs ${signalColor(p.signal)}`}>{p.signal.replace('_',' ')}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="progress-bar w-16">
                      <div className="progress-fill" style={{ width:`${p.confidence}%`, background:'linear-gradient(90deg,#6271f1,#00d4ff)' }}/>
                    </div>
                    <span className="font-mono text-xs text-text-muted">{p.confidence}%</span>
                  </div>
                </td>
                <td>
                  <button onClick={()=>setPositions(ps=>ps.filter(x=>x.symbol!==p.symbol))}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-neon-red transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
