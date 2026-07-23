export type Sector = 'AI' | 'Database' | 'Energy' | 'Quantum' | 'Chips';

export type ActionSignal = 'BUY' | 'SELL' | 'HOLD';

export interface MacdData {
  value: number;
  signal: number;
  histogram: number;
}

export interface PricePoint {
  date: string;
  price: number;
  volume: number;
  rsi: number;
}

export interface WhenToSellTarget {
  targetPrice: number;
  stopLossPrice: number;
  condition: string;
  triggerReason: string;
  trailingStopPercent: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  change24h: number;
  change24hPercent: number;
  low52w: number;
  high52w: number;
  peRatio: number;
  fwdPeRatio: number;
  priceToBook: number;
  pegRatio: number;
  debtToEquity: number;
  dividendYield: number;
  rsi: number;
  macd: MacdData;
  signal: ActionSignal;
  whenToSell: WhenToSellTarget;
  ratioStory: string;
  historicalData: PricePoint[];
}

export interface SpreadPoint {
  date: string;
  spread: number;
  zScore: number;
  priceA: number;
  priceB: number;
}

export interface PairCorrelation {
  id: string;
  symbolA: string;
  symbolB: string;
  sectorA: Sector;
  sectorB: Sector;
  pearsonCorrelation: number; // e.g., 0.88 or -0.42
  volatilityA: number; // e.g. 34.2 (%)
  volatilityB: number; // e.g. 28.1 (%)
  volatilityRatio: number; // volatilityA / volatilityB
  beta: number;
  hedgeRatio: string; // e.g., "1.22 : 1.00"
  strategyType: 'Pair Arbitrage' | 'Volatility Parity' | 'Beta Neutral' | 'Cross-Sector Hedge';
  logicDescription: string;
  historicalSpread: SpreadPoint[];
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  date: string;
  totalValue: number;
  notes?: string;
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  sector: Sector;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  allocationPercent: number;
  signal: ActionSignal;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  cashBalance: number;
  holdings: PortfolioHolding[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface RealTimeAlert {
  id: string;
  timestamp: string;
  symbol: string;
  title: string;
  message: string;
  type: 'BUY' | 'SELL' | 'ALERT' | 'PAIR_SPREAD';
  read: boolean;
}
