// ============================================================
// Core Types for QuantumEdge AI Platform
// ============================================================

export type Direction = 'UP' | 'DOWN' | 'SIDEWAYS';
export type AssetClass = 'STOCK' | 'CRYPTO' | 'ETF' | 'FOREX' | 'COMMODITY';
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
export type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK';
export type MarketRegime = 'BULL' | 'BEAR' | 'RANGING' | 'VOLATILE' | 'BREAKOUT';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface OHLCV {
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  vwap: number;
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  sma20: number;
  sma50: number;
  atr: number;
  stochK: number;
  stochD: number;
  cci: number;
  obv: number;
  adx: number;
  williamsR: number;
  mfi: number;
  supertrend: number;
  ichimokuCloud: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
  };
  fibLevels: {
    level236: number;
    level382: number;
    level500: number;
    level618: number;
    level786: number;
  };
}

export interface ModelPrediction {
  modelName: string;
  modelType: 'LSTM' | 'GRU' | 'Transformer' | 'XGBoost' | 'LightGBM' | 'CatBoost' | 'RandomForest' | 'CNN' | 'ViT' | 'FinBERT' | 'RL' | 'Ensemble';
  direction: Direction;
  confidence: number; // 0-100
  priceTarget: number;
  expectedMove: number; // percentage
  weight: number; // ensemble weight
}

export interface EnsemblePrediction {
  symbol: string;
  timeframe: Timeframe;
  timestamp: number;
  direction: Direction;
  confidence: number; // Bayesian-calibrated, 0-100
  expectedMove: number; // percentage
  priceTarget: number;
  stopLoss: number;
  takeProfitTargets: [number, number, number]; // TP1, TP2, TP3
  breakoutProbability: number;
  volatilityEstimate: number; // annualized
  nextCandleDirection: Direction;
  swingTradeProbability: number;
  marketRegime: MarketRegime;
  riskLevel: RiskLevel;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  models: ModelPrediction[];
  uncertainty: {
    lower: number;
    upper: number;
  };
}

export interface SentimentData {
  overall: number; // -1 to 1
  label: 'VERY_BEARISH' | 'BEARISH' | 'NEUTRAL' | 'BULLISH' | 'VERY_BULLISH';
  newsScore: number;
  twitterScore: number;
  redditScore: number;
  institutionalFlow: number;
  fearGreedIndex: number;
  newsCount: number;
  recentHeadlines: NewsItem[];
  sectorSentiment: Record<string, number>;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: number;
  sentiment: number;
  sentimentLabel: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  relevance: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  entities: string[];
}

export interface ChartPatternResult {
  patterns: DetectedPattern[];
  supportLevels: number[];
  resistanceLevels: number[];
  trendlines: TrendLine[];
  keyZones: PriceZone[];
  volumeProfile: VolumeProfileBar[];
  analysisText: string;
  confidence: number;
}

export interface DetectedPattern {
  name: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  description: string;
  priceTarget: number;
  timeHorizon: string;
  icon: string;
}

export interface TrendLine {
  type: 'SUPPORT' | 'RESISTANCE' | 'ASCENDING' | 'DESCENDING';
  startPrice: number;
  endPrice: number;
  strength: number;
}

export interface PriceZone {
  type: 'DEMAND' | 'SUPPLY' | 'BREAKOUT' | 'REVERSAL';
  priceRange: [number, number];
  strength: number;
  description: string;
}

export interface VolumeProfileBar {
  price: number;
  volume: number;
  side: 'BUY' | 'SELL' | 'NEUTRAL';
}

export interface SHAPExplanation {
  feature: string;
  value: number;
  contribution: number;
  description: string;
  category: 'TECHNICAL' | 'SENTIMENT' | 'FUNDAMENTAL' | 'MACRO' | 'PATTERN';
}

export interface BacktestResult {
  strategy: string;
  period: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgHoldingPeriod: number;
  calmarRatio: number;
  trades: BacktestTrade[];
  equityCurve: { time: number; value: number }[];
}

export interface BacktestTrade {
  entry: number;
  exit: number;
  direction: 'LONG' | 'SHORT';
  pnl: number;
  pnlPct: number;
  holdingPeriod: number;
}

export interface MarketSnapshot {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  high52w: number;
  low52w: number;
  avgVolume: number;
}

export interface PortfolioPosition {
  symbol: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
  weight: number;
  signal: EnsemblePrediction;
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'PRICE' | 'PATTERN' | 'SENTIMENT' | 'BREAKOUT' | 'SIGNAL' | 'ANOMALY';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: number;
  triggered: boolean;
}

export interface MacroData {
  vix: number;
  dxy: number;
  sp500: number;
  nasdaq: number;
  dow: number;
  btc: number;
  goldUSD: number;
  tenYearYield: number;
  fedFundsRate: number;
  inflationRate: number;
  gdpGrowth: number;
  unemploymentRate: number;
  correlations: Record<string, number>;
}
