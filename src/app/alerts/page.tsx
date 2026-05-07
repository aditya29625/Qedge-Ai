'use client';

import { useState } from 'react';
import { ShieldAlert, Bell, BellOff, AlertTriangle, Info, Zap, TrendingUp, TrendingDown, Eye, Trash2, Plus, CheckCircle } from 'lucide-react';

interface Alert {
  id: string; symbol: string; type: string; message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL'; timestamp: number; triggered: boolean;
}

const SAMPLE_ALERTS: Alert[] = [
  { id:'1', symbol:'NVDA', type:'BREAKOUT', message:'Price broke above $830 resistance on 3× average volume. Ensemble signal: STRONG_BUY (88%).', severity:'CRITICAL', timestamp: Date.now()-300000, triggered:true },
  { id:'2', symbol:'BTC', type:'SIGNAL', message:'Transformer model flipped to BULLISH after 3 consecutive bearish candles. Sentiment score +0.72.', severity:'WARNING', timestamp: Date.now()-900000, triggered:true },
  { id:'3', symbol:'TSLA', type:'PATTERN', message:'Head & Shoulders pattern detected with 82% confidence. Potential reversal zone at $248.', severity:'WARNING', timestamp: Date.now()-1800000, triggered:true },
  { id:'4', symbol:'AAPL', type:'ANOMALY', message:'Volume spike 4.2× average detected. Unusual options activity — 10k calls at $185 strike.', severity:'CRITICAL', timestamp: Date.now()-3600000, triggered:true },
  { id:'5', symbol:'SPY', type:'SENTIMENT', message:'FinBERT news sentiment dropped to -0.65 on macro data release. VIX elevated.', severity:'WARNING', timestamp: Date.now()-7200000, triggered:true },
  { id:'6', symbol:'ETH', type:'PRICE', message:'ETH/USD within 1.2% of major support zone $3,280. Watch for bounce or breakdown.', severity:'INFO', timestamp: Date.now()-10800000, triggered:false },
  { id:'7', symbol:'MSFT', type:'SIGNAL', message:'RSI reached oversold territory (28.4). LSTM model predicts mean reversion within 2-3 candles.', severity:'INFO', timestamp: Date.now()-14400000, triggered:false },
  { id:'8', symbol:'GOOGL', type:'PATTERN', message:'Cup & Handle formation completing. Target projection: +6.8% over 5-day horizon.', severity:'INFO', timestamp: Date.now()-21600000, triggered:false },
];

const SEVERITY_CONFIG = {
  CRITICAL: { color:'text-neon-red', bg:'bg-red-500/10 border-red-500/30', icon:<AlertTriangle size={14} className="text-neon-red"/> },
  WARNING:  { color:'text-neon-gold', bg:'bg-yellow-500/10 border-yellow-500/30', icon:<AlertTriangle size={14} className="text-neon-gold"/> },
  INFO:     { color:'text-neon-blue', bg:'bg-blue-500/10 border-blue-500/30', icon:<Info size={14} className="text-neon-blue"/> },
};

const TYPE_BADGES: Record<string, string> = {
  BREAKOUT:'bg-green-500/20 text-neon-green border-green-500/30',
  SIGNAL:  'bg-brand-500/20 text-brand-300 border-brand-500/30',
  PATTERN: 'bg-purple-500/20 text-neon-purple border-purple-500/30',
  ANOMALY: 'bg-red-500/20 text-neon-red border-red-500/30',
  SENTIMENT:'bg-pink-500/20 text-pink-300 border-pink-500/30',
  PRICE:   'bg-yellow-500/20 text-neon-gold border-yellow-500/30',
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(SAMPLE_ALERTS);
  const [filter, setFilter] = useState<'ALL'|'CRITICAL'|'WARNING'|'INFO'>('ALL');
  const [newSymbol, setNewSymbol] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.severity === filter);
  const counts = {
    CRITICAL: alerts.filter(a=>a.severity==='CRITICAL').length,
    WARNING: alerts.filter(a=>a.severity==='WARNING').length,
    INFO: alerts.filter(a=>a.severity==='INFO').length,
  };

  const fmt = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ago`;
  };

  const dismiss = (id: string) => setAlerts(a => a.filter(x => x.id !== id));
  const dismissAll = () => setAlerts([]);

  return (
    <div className="flex flex-col h-full overflow-y-auto content-scroll p-6 gap-6 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert size={24} className="text-neon-red" />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Risk Alerts &amp; Monitoring</h1>
            <p className="text-sm text-text-muted">Real-time anomaly detection, pattern alerts &amp; signal notifications</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2"><div className="live-dot"/><span className="text-xs text-neon-green font-mono">MONITORING LIVE</span></div>
          <button onClick={dismissAll} className="btn-ghost text-xs flex items-center gap-1.5"><Trash2 size={12}/>Clear All</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Total Active', val: alerts.length, color:'text-text-primary', bg:'bg-white/5 border-white/10' },
          { label:'Critical', val: counts.CRITICAL, color:'text-neon-red', bg:'bg-red-500/10 border-red-500/25' },
          { label:'Warnings', val: counts.WARNING, color:'text-neon-gold', bg:'bg-yellow-500/10 border-yellow-500/25' },
          { label:'Info', val: counts.INFO, color:'text-neon-blue', bg:'bg-blue-500/10 border-blue-500/25' },
        ].map(s => (
          <div key={s.label} className={`glass rounded-2xl p-5 border ${s.bg} text-center`}>
            <div className={`text-3xl font-black font-mono ${s.color}`}>{s.val}</div>
            <div className="text-xs text-text-muted mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Alert Feed */}
        <div className="col-span-2 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex gap-1">
              {(['ALL','CRITICAL','WARNING','INFO'] as const).map(f => (
                <button key={f} onClick={()=>setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter===f?'bg-brand-600/25 text-neon-blue border border-brand-500/30':'text-text-muted hover:text-text-primary hover:bg-white/5'}`}>
                  {f}
                </button>
              ))}
            </div>
            <span className="text-xs text-text-muted">{filtered.length} alerts</span>
          </div>

          <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto content-scroll">
            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <CheckCircle size={40} className="text-neon-green mx-auto mb-3 opacity-40"/>
                <p className="text-text-muted text-sm">No alerts in this category</p>
              </div>
            )}
            {filtered.map(alert => {
              const cfg = SEVERITY_CONFIG[alert.severity];
              return (
                <div key={alert.id} className={`p-4 flex gap-4 hover:bg-white/3 transition-all border-l-2 ${alert.severity==='CRITICAL'?'border-l-neon-red':alert.severity==='WARNING'?'border-l-neon-gold':'border-l-neon-blue'}`}>
                  <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono font-black text-text-primary text-sm">{alert.symbol}</span>
                      <span className={`badge border text-xs ${TYPE_BADGES[alert.type]??'bg-white/10 text-text-muted border-white/10'}`}>{alert.type}</span>
                      <span className={`badge border text-xs ${cfg.bg} ${cfg.color}`}>{alert.severity}</span>
                      {alert.triggered && <span className="badge bg-green-500/20 text-neon-green border border-green-500/30 text-xs">TRIGGERED</span>}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{alert.message}</p>
                    <span className="text-xs text-text-muted mt-1.5 block">{fmt(alert.timestamp)}</span>
                  </div>
                  <button onClick={()=>dismiss(alert.id)} className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg text-text-muted hover:text-neon-red transition-colors self-start">
                    <Trash2 size={13}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Create Alert + Channels */}
        <div className="flex flex-col gap-4">
          {/* Create Alert */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><Plus size={14}/>Create Alert</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Symbol</label>
                <input className="input-glass w-full" placeholder="e.g. AAPL" value={newSymbol} onChange={e=>setNewSymbol(e.target.value.toUpperCase())}/>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Alert Type</label>
                <select className="input-glass w-full">
                  {['Price Level','Pattern Detected','AI Signal Change','Sentiment Shift','Breakout','Anomaly'].map(t=>(
                    <option key={t} className="bg-dark-500">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Price Target</label>
                <input className="input-glass w-full" placeholder="e.g. 185.00" value={newPrice} onChange={e=>setNewPrice(e.target.value)}/>
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Severity</label>
                <select className="input-glass w-full">
                  {['INFO','WARNING','CRITICAL'].map(s=><option key={s} className="bg-dark-500">{s}</option>)}
                </select>
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Bell size={14}/> Create Alert
              </button>
            </div>
          </div>

          {/* Notification channels */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><Zap size={14}/>Notification Channels</h3>
            <div className="space-y-3">
              {[
                { label:'Dashboard', active:true, icon:'🖥️' },
                { label:'Telegram Bot', active:true, icon:'📱' },
                { label:'Discord Webhook', active:false, icon:'🎮' },
                { label:'Email (SMTP)', active:false, icon:'📧' },
                { label:'Slack', active:false, icon:'💬' },
              ].map(c=>(
                <div key={c.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span className="text-sm text-text-secondary">{c.label}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${c.active?'bg-neon-green/30 border border-neon-green/50':'bg-white/10 border border-white/10'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all ${c.active?'left-5 bg-neon-green':'left-0.5 bg-text-muted'}`}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edge case warnings */}
          <div className="glass rounded-2xl p-5 border border-yellow-500/20 bg-yellow-500/5">
            <h3 className="text-sm font-semibold text-neon-gold uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle size={14}/>Edge Cases Monitored</h3>
            <div className="space-y-1.5">
              {['Market holiday detection','Circuit breaker events','Flash crash anomaly','Low liquidity warning','Black swan probability','Data feed integrity','Model drift detection','Timezone mismatch guard'].map(e=>(
                <div key={e} className="flex items-center gap-2 text-xs text-text-muted">
                  <CheckCircle size={10} className="text-neon-green flex-shrink-0"/>
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
