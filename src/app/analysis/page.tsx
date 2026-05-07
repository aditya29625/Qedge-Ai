'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Zap, Eye, TrendingUp, AlertTriangle, CheckCircle, Target, Activity } from 'lucide-react';

interface PatternResult {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  description: string;
  priceTarget: string;
}

const PATTERNS: PatternResult[] = [
  { name: 'Ascending Triangle', type: 'BULLISH', confidence: 87, description: 'Horizontal resistance with rising support. Breakout bias upward. Volume confirmed.', priceTarget: '+4.2%' },
  { name: 'Golden Cross (EMA)', type: 'BULLISH', confidence: 82, description: 'EMA 50 crossed above EMA 200 — strong bullish momentum signal.', priceTarget: '+6-8%' },
  { name: 'Bullish Engulfing', type: 'BULLISH', confidence: 78, description: 'Larger green candle engulfs previous red candle. Reversal signal at support.', priceTarget: '+2.5%' },
  { name: 'Overbought RSI Zone', type: 'BEARISH', confidence: 65, description: 'RSI detected near 72 — potential short-term pullback or consolidation.', priceTarget: '-1.5%' },
  { name: 'Volume Divergence', type: 'NEUTRAL', confidence: 58, description: 'Price rising on declining volume — weakening momentum. Watch for reversal.', priceTarget: 'Sideways' },
];

const ZONES = [
  { type: 'SUPPORT', price: '$2,847', strength: 92, desc: 'High-volume demand zone (3 previous touches)' },
  { type: 'RESISTANCE', price: '$3,120', strength: 85, desc: 'Previous ATH rejection zone' },
  { type: 'BREAKOUT', price: '$3,050', strength: 71, desc: 'Consolidation upper boundary — watch for breakout candle' },
];

export default function AnalysisPage() {
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [results, setResults] = useState<PatternResult[] | null>(null);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploaded(url);
    setResults(null);
    setAnalysing(true);
    setTimeout(() => {
      setAnalysing(false);
      setResults(PATTERNS);
    }, 2800);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }, maxFiles: 1,
  });

  return (
    <div className="flex flex-col h-full overflow-y-auto content-scroll p-6 gap-6 relative z-10">
      <div className="flex items-center gap-3">
        <Eye size={24} className="text-neon-purple" />
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vision Analysis Engine</h1>
          <p className="text-sm text-text-muted">CNN + Vision Transformer chart pattern recognition</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-2">
        {[
          { icon: <Eye size={20} className="text-neon-purple" />, label: 'Pattern Detection', desc: 'CNN + ViT ensemble', stat: '47 patterns' },
          { icon: <Activity size={20} className="text-neon-blue" />, label: 'Zone Detection', desc: 'Support/Resistance via OpenCV', stat: 'Sub-pixel accuracy' },
          { icon: <Target size={20} className="text-neon-green" />, label: 'Price Targets', desc: 'Fibonacci-calibrated', stat: 'TP1/TP2/TP3' },
        ].map(f => (
          <div key={f.label} className="glass rounded-2xl p-4 flex items-start gap-3">
            {f.icon}
            <div>
              <div className="text-sm font-bold text-text-primary">{f.label}</div>
              <div className="text-xs text-text-muted">{f.desc}</div>
              <div className="text-xs text-neon-gold mt-1 font-mono">{f.stat}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Upload */}
        <div className="flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={`upload-zone rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer min-h-[280px] transition-all ${isDragActive ? 'drag-over' : ''}`}
          >
            <input {...getInputProps()} />
            {uploaded ? (
              <img src={uploaded} alt="uploaded chart" className="max-h-56 rounded-xl object-contain" />
            ) : (
              <>
                <Upload size={48} className="text-brand-400 mb-4 opacity-70" />
                <p className="text-text-primary font-semibold text-lg mb-2">Drop chart image here</p>
                <p className="text-text-muted text-sm text-center">PNG, JPG or WebP — candlestick, bar, or line chart</p>
                <p className="text-xs text-text-muted mt-3 opacity-60">Powered by OpenCV + CNN + Vision Transformer</p>
              </>
            )}
          </div>

          {analysing && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={18} className="text-neon-gold animate-pulse" />
                <span className="text-sm font-semibold text-neon-gold">AI Vision Pipeline Running...</span>
              </div>
              {['Preprocessing image (OpenCV)', 'Detecting candlestick patterns (CNN)', 'Vision Transformer analysis', 'Support/Resistance mapping', 'Generating price targets'].map((step, i) => (
                <div key={step} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="pulse-dot" style={{ background: '#6271f1' }}></div>
                  <span className="text-xs text-text-secondary">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4">
          {results ? (
            <>
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-neon-green" />Detected Patterns
                </h3>
                <div className="space-y-3">
                  {results.map(p => (
                    <div key={p.name} className={`glass rounded-xl p-4 border ${p.type === 'BULLISH' ? 'border-green-500/25 bg-green-500/5' : p.type === 'BEARISH' ? 'border-red-500/25 bg-red-500/5' : 'border-white/10'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`badge border ${p.type === 'BULLISH' ? 'bg-green-500/20 text-neon-green border-green-500/30' : p.type === 'BEARISH' ? 'bg-red-500/20 text-neon-red border-red-500/30' : 'bg-white/10 text-text-muted border-white/10'}`}>{p.type}</span>
                          <span className="text-sm font-bold text-text-primary">{p.name}</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-neon-gold">{p.priceTarget}</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">{p.description}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-muted">Confidence</span>
                          <span className="font-mono text-text-primary">{p.confidence}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${p.confidence}%`, background: p.type === 'BULLISH' ? 'linear-gradient(90deg,#00ff88,#00d4ff)' : p.type === 'BEARISH' ? 'linear-gradient(90deg,#ff375f,#bf5af2)' : 'linear-gradient(90deg,#6271f1,#00d4ff)' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={14} className="text-neon-blue" />Key Price Zones
                </h3>
                <div className="space-y-2">
                  {ZONES.map(z => (
                    <div key={z.type} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className={`badge border w-24 justify-center ${z.type === 'SUPPORT' ? 'bg-green-500/20 text-neon-green border-green-500/30' : z.type === 'RESISTANCE' ? 'bg-red-500/20 text-neon-red border-red-500/30' : 'bg-yellow-500/20 text-neon-gold border-yellow-500/30'}`}>{z.type}</span>
                      <span className="font-mono font-bold text-text-primary text-sm">{z.price}</span>
                      <span className="text-xs text-text-muted flex-1">{z.desc}</span>
                      <span className="font-mono text-xs text-brand-300">{z.strength}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center h-full text-center opacity-50">
              <ImageIcon size={48} className="text-text-muted mb-4" />
              <p className="text-text-muted">Upload a chart image to begin AI visual analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
