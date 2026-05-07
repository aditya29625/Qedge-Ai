import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-radial from-brand-900 to-dark-600 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 z-0"></div>
      <div className="absolute inset-0 noise z-0"></div>
      
      <div className="z-10 text-center max-w-4xl glass p-12 rounded-3xl glow-border">
        <h1 className="text-6xl font-bold mb-6 tracking-tight">
          <span className="gradient-text">QuantumEdge</span> AI
        </h1>
        <h2 className="text-2xl text-text-secondary mb-8 font-light">
          World-Class Multi-Model ML Ensemble for Quantitative Market Analysis
        </h2>
        
        <p className="text-text-muted mb-12 text-lg max-w-2xl mx-auto">
          Combining LSTM, Vision Transformers, XGBoost, and FinBERT for unparalleled predictive edge in global equity and crypto markets.
        </p>
        
        <div className="flex flex-wrap gap-6 justify-center">
          <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 shadow-neon-blue">
            Launch Trading Terminal
          </Link>
          <Link href="/analysis" className="btn-ghost text-lg px-8 py-4">
            Upload Chart Image
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-text-muted">
          <div className="glass p-4 rounded-xl">
            <div className="text-neon-blue font-mono text-xl mb-1">99.8%</div>
            <div>Uptime</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-neon-green font-mono text-xl mb-1">&lt;50ms</div>
            <div>Inference Latency</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-neon-purple font-mono text-xl mb-1">12+</div>
            <div>Ensemble Models</div>
          </div>
          <div className="glass p-4 rounded-xl">
            <div className="text-neon-gold font-mono text-xl mb-1">24/7</div>
            <div>Live Market Data</div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center text-text-muted text-xs z-10 opacity-60 max-w-2xl">
        <p>DISCLAIMER: Financial markets are stochastic. All predictions carry risk. No AI system can guarantee profits. For institutional demonstration purposes only.</p>
      </div>
    </main>
  );
}
