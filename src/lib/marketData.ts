import { OHLCV, TechnicalIndicators, EnsemblePrediction, SentimentData, ModelPrediction, Direction, SHAPExplanation, BacktestResult, MarketSnapshot, MacroData, NewsItem } from './types';

// ── helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// ── OHLCV generator ───────────────────────────────────────────────────────────
export function generateOHLCV(symbol: string, bars = 200, intervalMs = 3_600_000): OHLCV[] {
  const seed: Record<string, number> = {
    AAPL: 178, TSLA: 245, NVDA: 820, MSFT: 415, GOOGL: 172,
    AMZN: 182, META: 488, BTC: 68000, ETH: 3500, SOL: 165,
    SPY: 520, QQQ: 445, RELIANCE: 2950, TCS: 3800,
  };
  let price = seed[symbol] ?? 100;
  const now = Date.now();
  const data: OHLCV[] = [];

  for (let i = bars; i >= 0; i--) {
    const time = now - i * intervalMs;
    const drift = rand(-0.015, 0.018);
    const vol = rand(0.005, 0.025);
    const open = price;
    const close = clamp(open * (1 + drift + rand(-vol, vol)), open * 0.92, open * 1.08);
    const high = Math.max(open, close) * (1 + rand(0, vol * 0.6));
    const low = Math.min(open, close) * (1 - rand(0, vol * 0.6));
    const volume = rand(500_000, 8_000_000);
    data.push({ time, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +close.toFixed(2), volume: +volume.toFixed(0) });
    price = close;
  }
  return data;
}

// ── Technical indicators (rolling) ───────────────────────────────────────────
export function computeIndicators(data: OHLCV[]): TechnicalIndicators {
  const closes = data.map(d => d.close);
  const n = closes.length;
  const last = closes[n - 1];
  const sma = (period: number) => closes.slice(-period).reduce((a, b) => a + b, 0) / period;
  const ema = (period: number) => {
    const k = 2 / (period + 1);
    let e = closes[0];
    closes.forEach(c => { e = c * k + e * (1 - k); });
    return e;
  };

  // RSI
  const gains: number[] = [], losses: number[] = [];
  for (let i = 1; i < Math.min(15, n); i++) {
    const diff = closes[n - i] - closes[n - i - 1];
    if (diff > 0) gains.push(diff); else losses.push(-diff);
  }
  const avgGain = gains.reduce((a, b) => a + b, 0) / 14 || 0.01;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / 14 || 0.01;
  const rs = avgGain / avgLoss;
  const rsi = clamp(100 - 100 / (1 + rs), 0, 100);

  // MACD
  const ema12 = ema(12), ema26 = ema(26);
  const macd = ema12 - ema26;
  const macdSignal = macd * 0.9;
  const macdHistogram = macd - macdSignal;

  // Bollinger Bands
  const sma20val = sma(20);
  const stddev = Math.sqrt(closes.slice(-20).reduce((a, b) => a + Math.pow(b - sma20val, 2), 0) / 20);
  const atr = data.slice(-14).reduce((acc, bar, i, arr) => {
    if (i === 0) return acc;
    const prev = arr[i - 1];
    return acc + Math.max(bar.high - bar.low, Math.abs(bar.high - prev.close), Math.abs(bar.low - prev.close));
  }, 0) / 14;

  return {
    rsi: +rsi.toFixed(2),
    macd: +macd.toFixed(3),
    macdSignal: +macdSignal.toFixed(3),
    macdHistogram: +macdHistogram.toFixed(3),
    bbUpper: +(sma20val + 2 * stddev).toFixed(2),
    bbMiddle: +sma20val.toFixed(2),
    bbLower: +(sma20val - 2 * stddev).toFixed(2),
    vwap: +(last * rand(0.995, 1.005)).toFixed(2),
    ema9: +ema(9).toFixed(2),
    ema21: +ema(21).toFixed(2),
    ema50: +ema(50).toFixed(2),
    ema200: +ema(200).toFixed(2),
    sma20: +sma20val.toFixed(2),
    sma50: +sma(50).toFixed(2),
    atr: +atr.toFixed(3),
    stochK: +rand(20, 80).toFixed(2),
    stochD: +rand(20, 80).toFixed(2),
    cci: +rand(-120, 120).toFixed(2),
    obv: +rand(1e6, 1e8).toFixed(0),
    adx: +rand(15, 55).toFixed(2),
    williamsR: +rand(-90, -10).toFixed(2),
    mfi: +rand(30, 70).toFixed(2),
    supertrend: +(last * rand(0.97, 1.03)).toFixed(2),
    ichimokuCloud: {
      tenkan: +(last * rand(0.98, 1.02)).toFixed(2),
      kijun: +(last * rand(0.97, 1.03)).toFixed(2),
      senkouA: +(last * rand(0.96, 1.04)).toFixed(2),
      senkouB: +(last * rand(0.95, 1.05)).toFixed(2),
    },
    fibLevels: {
      level236: +(last * 0.9764).toFixed(2),
      level382: +(last * 0.9618).toFixed(2),
      level500: +(last * 0.95).toFixed(2),
      level618: +(last * 0.9382).toFixed(2),
      level786: +(last * 0.9214).toFixed(2),
    },
  };
}

// ── Ensemble prediction ───────────────────────────────────────────────────────
export function generatePrediction(symbol: string, data: OHLCV[], indicators: TechnicalIndicators): EnsemblePrediction {
  const last = data[data.length - 1];
  const price = last.close;

  const bullScore =
    (indicators.rsi < 70 && indicators.rsi > 40 ? 1 : 0) +
    (indicators.macd > 0 ? 1 : 0) +
    (price > indicators.ema50 ? 1 : 0) +
    (price > indicators.sma50 ? 1 : 0) +
    (indicators.adx > 25 ? 0.5 : 0) +
    rand(0, 2);

  const bearScore =
    (indicators.rsi > 70 ? 1 : 0) +
    (indicators.macd < 0 ? 1 : 0) +
    (price < indicators.ema50 ? 1 : 0) +
    rand(0, 2);

  const dir: Direction = bullScore > bearScore + 1 ? 'UP' : bearScore > bullScore + 1 ? 'DOWN' : 'SIDEWAYS';
  const confidence = clamp(50 + Math.abs(bullScore - bearScore) * 8 + rand(-5, 10), 45, 94);
  const expectedMove = rand(0.8, 4.5) * (dir === 'UP' ? 1 : dir === 'DOWN' ? -1 : rand(-1, 1));
  const atrMultiplier = indicators.atr;

  const models: ModelPrediction[] = [
    { modelName: 'LSTM-256', modelType: 'LSTM', direction: dir, confidence: clamp(confidence + rand(-8, 8), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.18 },
    { modelName: 'GRU-128', modelType: 'GRU', direction: dir, confidence: clamp(confidence + rand(-6, 6), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.12 },
    { modelName: 'Temporal Fusion', modelType: 'Transformer', direction: dir, confidence: clamp(confidence + rand(-5, 10), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.20 },
    { modelName: 'XGBoost-v2', modelType: 'XGBoost', direction: dir, confidence: clamp(confidence + rand(-10, 10), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.15 },
    { modelName: 'LightGBM', modelType: 'LightGBM', direction: dir, confidence: clamp(confidence + rand(-8, 8), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.12 },
    { modelName: 'CatBoost', modelType: 'CatBoost', direction: dir, confidence: clamp(confidence + rand(-7, 7), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.08 },
    { modelName: 'ViT-Chart', modelType: 'ViT', direction: dir, confidence: clamp(confidence + rand(-12, 12), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.05 },
    { modelName: 'FinBERT-NLP', modelType: 'FinBERT', direction: dir, confidence: clamp(confidence + rand(-10, 10), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.05 },
    { modelName: 'PPO-RL Agent', modelType: 'RL', direction: dir, confidence: clamp(confidence + rand(-15, 15), 40, 96), priceTarget: price * (1 + expectedMove / 100), expectedMove, weight: 0.05 },
  ];

  return {
    symbol,
    timeframe: '1h',
    timestamp: Date.now(),
    direction: dir,
    confidence: +confidence.toFixed(1),
    expectedMove: +expectedMove.toFixed(2),
    priceTarget: +(price * (1 + expectedMove / 100)).toFixed(2),
    stopLoss: +(price - atrMultiplier * 1.5).toFixed(2),
    takeProfitTargets: [
      +(price + atrMultiplier * 1).toFixed(2),
      +(price + atrMultiplier * 2).toFixed(2),
      +(price + atrMultiplier * 3.5).toFixed(2),
    ],
    breakoutProbability: +rand(20, 85).toFixed(1),
    volatilityEstimate: +rand(15, 55).toFixed(1),
    nextCandleDirection: rand(0, 1) > 0.45 ? 'UP' : 'DOWN',
    swingTradeProbability: +rand(35, 78).toFixed(1),
    marketRegime: ['BULL', 'RANGING', 'VOLATILE', 'BREAKOUT', 'BEAR'][randInt(0, 4)] as any,
    riskLevel: ['LOW', 'MEDIUM', 'HIGH'][randInt(0, 2)] as any,
    signal: dir === 'UP' ? (confidence > 75 ? 'STRONG_BUY' : 'BUY') : dir === 'DOWN' ? (confidence > 75 ? 'STRONG_SELL' : 'SELL') : 'HOLD',
    models,
    uncertainty: { lower: +(price * (1 + (expectedMove - 1.5) / 100)).toFixed(2), upper: +(price * (1 + (expectedMove + 1.5) / 100)).toFixed(2) },
  };
}

// ── Sentiment ─────────────────────────────────────────────────────────────────
export function generateSentiment(symbol: string): SentimentData {
  const score = +rand(-0.6, 0.8).toFixed(2);
  const label = score > 0.5 ? 'VERY_BULLISH' : score > 0.1 ? 'BULLISH' : score > -0.1 ? 'NEUTRAL' : score > -0.5 ? 'BEARISH' : 'VERY_BEARISH';

  const headlines: NewsItem[] = [
    { id: '1', title: `${symbol} Reports Record Revenue Beating Analyst Estimates by 12%`, source: 'Bloomberg', url: '#', timestamp: Date.now() - 3600000, sentiment: 0.85, sentimentLabel: 'POSITIVE', relevance: 0.95, impact: 'HIGH', entities: [symbol, 'Revenue', 'Q4'] },
    { id: '2', title: `Fed Signals Potential Rate Cut as Inflation Cools to 2.8%`, source: 'Reuters', url: '#', timestamp: Date.now() - 7200000, sentiment: 0.45, sentimentLabel: 'POSITIVE', relevance: 0.7, impact: 'HIGH', entities: ['Federal Reserve', 'Inflation', 'Rate Cut'] },
    { id: '3', title: `${symbol} Insider Selling Activity Increases; Analysts Maintain Cautious Outlook`, source: 'WSJ', url: '#', timestamp: Date.now() - 14400000, sentiment: -0.35, sentimentLabel: 'NEGATIVE', relevance: 0.8, impact: 'MEDIUM', entities: [symbol, 'Insider', 'Analysts'] },
    { id: '4', title: `Technical Breakout: ${symbol} Tests Critical Resistance at All-Time High`, source: 'Investopedia', url: '#', timestamp: Date.now() - 21600000, sentiment: 0.3, sentimentLabel: 'POSITIVE', relevance: 0.85, impact: 'MEDIUM', entities: [symbol, 'Resistance', 'ATH'] },
    { id: '5', title: `Global Market Uncertainty Persists Amid Geopolitical Tensions`, source: 'FT', url: '#', timestamp: Date.now() - 28800000, sentiment: -0.55, sentimentLabel: 'NEGATIVE', relevance: 0.5, impact: 'MEDIUM', entities: ['Global Markets', 'Geopolitical', 'Uncertainty'] },
  ];

  return {
    overall: score,
    label: label as any,
    newsScore: +rand(-0.5, 0.9).toFixed(2),
    twitterScore: +rand(-0.4, 0.8).toFixed(2),
    redditScore: +rand(-0.6, 0.85).toFixed(2),
    institutionalFlow: +rand(-0.3, 0.7).toFixed(2),
    fearGreedIndex: randInt(20, 80),
    newsCount: randInt(40, 200),
    recentHeadlines: headlines,
    sectorSentiment: { Technology: 0.65, Finance: 0.3, Energy: -0.2, Healthcare: 0.45, Consumer: 0.1 },
  };
}

// ── SHAP explanations ─────────────────────────────────────────────────────────
export function generateSHAP(indicators: TechnicalIndicators, prediction: EnsemblePrediction): SHAPExplanation[] {
  const dir = prediction.direction === 'UP' ? 1 : -1;
  return ([
    { feature: 'EMA 50 Cross', value: indicators.ema50, contribution: +(rand(0.08, 0.22) * dir).toFixed(3), description: 'Price-EMA50 relationship signals trend direction', category: 'TECHNICAL' },
    { feature: 'RSI (14)', value: indicators.rsi, contribution: +(rand(0.05, 0.18) * dir).toFixed(3), description: 'Momentum oscillator in neutral bullish zone', category: 'TECHNICAL' },
    { feature: 'MACD Histogram', value: indicators.macdHistogram, contribution: +(rand(0.04, 0.15) * dir).toFixed(3), description: 'Bullish momentum building in histogram', category: 'TECHNICAL' },
    { feature: 'News Sentiment', value: 0.72, contribution: +(rand(0.03, 0.12) * dir).toFixed(3), description: 'FinBERT positive news sentiment detected', category: 'SENTIMENT' },
    { feature: 'Volume Profile', value: indicators.obv, contribution: +(rand(0.02, 0.10) * dir).toFixed(3), description: 'Institutional accumulation pattern in OBV', category: 'TECHNICAL' },
    { feature: 'Bollinger Band Width', value: indicators.bbUpper - indicators.bbLower, contribution: +(rand(-0.08, 0.08)).toFixed(3), description: 'Moderate volatility expansion', category: 'TECHNICAL' },
    { feature: 'Twitter Sentiment', value: 0.55, contribution: +(rand(0.01, 0.08) * dir).toFixed(3), description: 'Positive retail sentiment on social media', category: 'SENTIMENT' },
    { feature: 'ADX Strength', value: indicators.adx, contribution: +(rand(0.02, 0.09) * dir).toFixed(3), description: 'Trend strength indicator confirms direction', category: 'TECHNICAL' },
    { feature: 'P/E Ratio', value: 28.4, contribution: +(rand(-0.05, 0.05)).toFixed(3), description: 'Fair valuation relative to sector peers', category: 'FUNDAMENTAL' },
    { feature: 'VIX Level', value: 18.5, contribution: +(rand(-0.06, 0.02)).toFixed(3), description: 'Low fear environment supports bulls', category: 'MACRO' },
  ] as SHAPExplanation[]).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

// ── Market snapshots ──────────────────────────────────────────────────────────
export function generateMarketSnapshots(): MarketSnapshot[] {
  const assets = [
    { symbol: 'AAPL', name: 'Apple Inc.', base: 178 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', base: 820 },
    { symbol: 'TSLA', name: 'Tesla Inc.', base: 245 },
    { symbol: 'MSFT', name: 'Microsoft', base: 415 },
    { symbol: 'GOOGL', name: 'Alphabet', base: 172 },
    { symbol: 'META', name: 'Meta Platforms', base: 488 },
    { symbol: 'AMZN', name: 'Amazon', base: 182 },
    { symbol: 'BTC', name: 'Bitcoin', base: 68000 },
    { symbol: 'ETH', name: 'Ethereum', base: 3500 },
    { symbol: 'SPY', name: 'S&P 500 ETF', base: 520 },
  ];

  return assets.map(a => {
    const change = rand(-4, 4);
    const price = a.base * (1 + change / 100);
    return {
      symbol: a.symbol,
      name: a.name,
      assetClass: a.symbol.length <= 4 && ['BTC', 'ETH', 'SOL'].includes(a.symbol) ? 'CRYPTO' : a.symbol.includes('SPY') || a.symbol.includes('QQQ') ? 'ETF' : 'STOCK',
      price: +price.toFixed(2),
      change: +(price - a.base).toFixed(2),
      changePct: +change.toFixed(2),
      volume: randInt(5_000_000, 50_000_000),
      marketCap: +(a.base * rand(5e9, 3e12)).toFixed(0),
      pe: +rand(18, 45).toFixed(1),
      high52w: +(a.base * rand(1.05, 1.5)).toFixed(2),
      low52w: +(a.base * rand(0.5, 0.95)).toFixed(2),
      avgVolume: randInt(8_000_000, 40_000_000),
    } as MarketSnapshot;
  });
}

// ── Macro data ────────────────────────────────────────────────────────────────
export function generateMacroData(): MacroData {
  return {
    vix: +rand(12, 35).toFixed(2),
    dxy: +rand(100, 108).toFixed(2),
    sp500: +rand(4800, 5500).toFixed(2),
    nasdaq: +rand(15000, 18000).toFixed(2),
    dow: +rand(37000, 42000).toFixed(2),
    btc: +rand(60000, 75000).toFixed(2),
    goldUSD: +rand(2000, 2400).toFixed(2),
    tenYearYield: +rand(3.8, 5.2).toFixed(2),
    fedFundsRate: +rand(4.5, 5.5).toFixed(2),
    inflationRate: +rand(2.5, 4.2).toFixed(2),
    gdpGrowth: +rand(1.2, 3.5).toFixed(2),
    unemploymentRate: +rand(3.5, 5.0).toFixed(2),
    correlations: { SPY: 1.0, BTC: +rand(0.3, 0.7).toFixed(2), GOLD: +rand(-0.2, 0.3).toFixed(2), DXY: +rand(-0.5, 0.1).toFixed(2) },
  };
}

// ── Backtest results ──────────────────────────────────────────────────────────
export function generateBacktest(strategy: string, symbol: string): BacktestResult {
  const startCapital = 100000;
  const totalReturn = rand(-5, 85);
  const annualizedReturn = totalReturn / rand(1.5, 3);
  const trades = Array.from({ length: randInt(30, 80) }, (_, i) => {
    const pnlPct = rand(-4, 6);
    return {
      entry: +rand(50, 500).toFixed(2),
      exit: +rand(50, 500).toFixed(2),
      direction: (Math.random() > 0.3 ? 'LONG' : 'SHORT') as 'LONG' | 'SHORT',
      pnl: +(startCapital * pnlPct / 100).toFixed(2),
      pnlPct: +pnlPct.toFixed(2),
      holdingPeriod: randInt(1, 15),
    };
  });

  let equity = startCapital;
  const equityCurve = trades.map((t, i) => {
    equity += t.pnl;
    return { time: Date.now() - (trades.length - i) * 86400000, value: +equity.toFixed(2) };
  });

  const wins = trades.filter(t => t.pnl > 0).length;

  return {
    strategy,
    period: '2023-01-01 to 2024-05-01',
    totalReturn: +totalReturn.toFixed(2),
    annualizedReturn: +annualizedReturn.toFixed(2),
    sharpeRatio: +rand(0.4, 2.8).toFixed(2),
    sortinoRatio: +rand(0.5, 3.5).toFixed(2),
    maxDrawdown: +rand(-8, -35).toFixed(2),
    winRate: +(wins / trades.length * 100).toFixed(1),
    profitFactor: +rand(1.1, 2.6).toFixed(2),
    totalTrades: trades.length,
    avgHoldingPeriod: +rand(2, 10).toFixed(1),
    calmarRatio: +rand(0.3, 2.0).toFixed(2),
    trades,
    equityCurve,
  };
}
