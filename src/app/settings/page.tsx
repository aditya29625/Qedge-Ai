'use client';

import { Settings, Cpu, Database, Shield, Bell, Sliders, CheckCircle, Cloud, RefreshCw } from 'lucide-react';

const MODEL_CONFIG = [
  { name:'LSTM-256', type:'LSTM', enabled:true, weight:0.18, latency:'12ms', status:'ONLINE' },
  { name:'GRU-128', type:'GRU', enabled:true, weight:0.12, latency:'9ms', status:'ONLINE' },
  { name:'Temporal Fusion Transformer', type:'Transformer', enabled:true, weight:0.20, latency:'28ms', status:'ONLINE' },
  { name:'XGBoost-v2', type:'XGBoost', enabled:true, weight:0.15, latency:'4ms', status:'ONLINE' },
  { name:'LightGBM', type:'LightGBM', enabled:true, weight:0.12, latency:'3ms', status:'ONLINE' },
  { name:'CatBoost', type:'CatBoost', enabled:true, weight:0.08, latency:'5ms', status:'ONLINE' },
  { name:'ViT Chart Analyzer', type:'ViT', enabled:false, weight:0.05, latency:'45ms', status:'STANDBY' },
  { name:'FinBERT NLP', type:'FinBERT', enabled:true, weight:0.05, latency:'22ms', status:'ONLINE' },
  { name:'PPO-RL Agent', type:'RL', enabled:false, weight:0.05, latency:'18ms', status:'STANDBY' },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto content-scroll p-6 gap-6 relative z-10">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-text-secondary" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Platform Configuration</h1>
          <p className="text-sm text-text-muted">Model orchestration, data sources, API keys &amp; system settings</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Model Orchestration */}
        <div className="col-span-2 glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-white/5">
            <Cpu size={16} className="text-neon-blue" />
            <h3 className="text-sm font-semibold text-text-primary">Model Orchestration</h3>
            <span className="ml-auto text-xs text-text-muted">Ensemble weights sum = 1.00</span>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                {['Model','Type','Enabled','Weight','Latency','Status'].map(h=>(
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODEL_CONFIG.map(m => (
                <tr key={m.name}>
                  <td className="font-medium text-text-primary">{m.name}</td>
                  <td><span className="model-badge bg-brand-500/15 text-brand-300 border border-brand-500/25">{m.type}</span></td>
                  <td>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${m.enabled?'bg-neon-green/30 border border-neon-green/50':'bg-white/10 border border-white/10'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all ${m.enabled?'left-5 bg-neon-green':'left-0.5 bg-text-muted'}`}/>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="progress-bar w-20">
                        <div className="progress-fill" style={{ width:`${m.weight*100}%`, background:'linear-gradient(90deg,#6271f1,#00d4ff)' }}/>
                      </div>
                      <span className="font-mono text-xs text-text-muted">{m.weight}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-neon-green">{m.latency}</td>
                  <td>
                    <span className={`badge border text-xs ${m.status==='ONLINE'?'bg-green-500/20 text-neon-green border-green-500/30':'bg-white/10 text-text-muted border-white/10'}`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Data Sources */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Database size={14} className="text-neon-purple"/>Data Sources</h3>
          <div className="space-y-3">
            {[
              { name:'Yahoo Finance API', status:'CONNECTED', latency:'80ms', type:'OHLCV' },
              { name:'Alpha Vantage', status:'CONNECTED', latency:'120ms', type:'Fundamentals' },
              { name:'NewsAPI', status:'CONNECTED', latency:'45ms', type:'News NLP' },
              { name:'Twitter/X API v2', status:'LIMITED', latency:'200ms', type:'Social Sentiment' },
              { name:'FRED (Macro)', status:'CONNECTED', latency:'95ms', type:'Macroeconomic' },
              { name:'Binance WS', status:'CONNECTED', latency:'18ms', type:'Crypto Live' },
              { name:'Options Chain', status:'SIMULATED', latency:'—', type:'Options Flow' },
            ].map(d=>(
              <div key={d.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm text-text-primary">{d.name}</div>
                  <div className="text-xs text-text-muted">{d.type}</div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span className="font-mono text-xs text-text-muted">{d.latency}</span>
                  <span className={`badge border text-xs ${d.status==='CONNECTED'?'bg-green-500/20 text-neon-green border-green-500/30':d.status==='LIMITED'?'bg-yellow-500/20 text-neon-gold border-yellow-500/30':'bg-white/10 text-text-muted border-white/10'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          {/* Inference Settings */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Sliders size={14} className="text-neon-gold"/>Inference Settings</h3>
            <div className="space-y-4">
              {[
                { label:'Confidence Threshold', val:'65%', desc:'Minimum confidence to surface a signal' },
                { label:'Lookback Window', val:'200 bars', desc:'Historical candles fed to LSTM/Transformer' },
                { label:'Ensemble Method', val:'Weighted Avg', desc:'Bayesian-calibrated weighted average' },
                { label:'Uncertainty Estimation', val:'Monte Carlo', desc:'MC dropout × 50 forward passes' },
                { label:'Walk-Forward Splits', val:'12 folds', desc:'Time-series cross-validation folds' },
                { label:'Anomaly Threshold', val:'3σ', desc:'Standard deviations for outlier detection' },
              ].map(s=>(
                <div key={s.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-text-primary">{s.label}</div>
                    <div className="text-xs text-text-muted">{s.desc}</div>
                  </div>
                  <span className="font-mono text-sm font-bold text-neon-blue ml-4 flex-shrink-0">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Shield size={14} className="text-neon-green"/>Security &amp; Auth</h3>
            <div className="space-y-2">
              {['JWT Authentication (RS256)','Rate Limiting (100 req/min)','API Key Encryption (AES-256)','HTTPS/TLS 1.3 enforced','Request logging (ELK stack)','RBAC permissions'].map(f=>(
                <div key={f} className="flex items-center gap-2 text-sm text-text-secondary py-1.5 border-b border-white/5 last:border-0">
                  <CheckCircle size={12} className="text-neon-green flex-shrink-0"/>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2"><Cloud size={14} className="text-neon-blue"/>Infrastructure</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Backend', val:'FastAPI + Uvicorn' },
                { label:'Task Queue', val:'Celery + Redis' },
                { label:'Time-Series DB', val:'TimescaleDB' },
                { label:'Cache', val:'Redis Cluster' },
                { label:'Object Store', val:'AWS S3 / MinIO' },
                { label:'Deployment', val:'Docker + K8s' },
                { label:'CI/CD', val:'GitHub Actions' },
                { label:'Monitoring', val:'Prometheus + Grafana' },
              ].map(i=>(
                <div key={i.label} className="glass rounded-lg p-3">
                  <div className="text-xs text-text-muted">{i.label}</div>
                  <div className="text-xs font-bold font-mono text-text-primary mt-0.5">{i.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
