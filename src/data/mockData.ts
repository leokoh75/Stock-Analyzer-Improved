import { Stock, PairCorrelation, Transaction, MarketIndex, RealTimeAlert } from '../types';

// Generate 30 days of mock historical stock data
const generateHistory = (basePrice: number, volatility: number) => {
  const data = [];
  const now = new Date();
  let currentPrice = basePrice * (1 - (volatility * 0.15));
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const changePct = (Math.random() - 0.48) * (volatility / 10);
    currentPrice = Math.max(currentPrice * (1 + changePct), 1);
    const volume = Math.floor(Math.random() * 5000000) + 1000000;
    const rsi = Math.min(Math.max(Math.round(45 + (changePct * 300) + (Math.random() * 10 - 5)), 20), 85);
    
    data.push({
      date: dateStr,
      price: Number(currentPrice.toFixed(2)),
      volume,
      rsi
    });
  }
  return data;
};

export const INITIAL_STOCKS: Stock[] = [
  // --- AI TECH SECTOR ---
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'AI',
    price: 138.25,
    change24h: 3.42,
    change24hPercent: 2.54,
    low52w: 86.40,
    high52w: 140.76,
    peRatio: 52.4,
    fwdPeRatio: 34.1,
    priceToBook: 38.6,
    pegRatio: 1.15,
    debtToEquity: 0.18,
    dividendYield: 0.03,
    rsi: 68.4,
    macd: { value: 2.15, signal: 1.80, histogram: 0.35 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 165.00,
      stopLossPrice: 122.00,
      condition: 'Sell if 14-day RSI exceeds 82 or Forward P/E expands above 48x.',
      triggerReason: 'High growth momentum backed by Hopper & Blackwell server rack shipments.',
      trailingStopPercent: 8.5
    },
    ratioStory: 'NVIDIA displays a trailing P/E of 52.4x against a much lower Forward P/E of 34.1x, demonstrating massive expected earnings acceleration. The PEG ratio of 1.15 indicates fair valuation relative to its >40% forecasted earnings growth. Low debt-to-equity (0.18) safeguards balance sheet resilience during macro pullbacks.',
    historicalData: generateHistory(138.25, 3.2)
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'AI',
    price: 448.90,
    change24h: 1.85,
    change24hPercent: 0.41,
    low52w: 388.00,
    high52w: 468.35,
    peRatio: 36.2,
    fwdPeRatio: 29.8,
    priceToBook: 12.4,
    pegRatio: 2.10,
    debtToEquity: 0.35,
    dividendYield: 0.72,
    rsi: 54.2,
    macd: { value: 0.85, signal: 0.92, histogram: -0.07 },
    signal: 'HOLD',
    whenToSell: {
      targetPrice: 485.00,
      stopLossPrice: 410.00,
      condition: 'Hold while Azure AI growth remains >30%. Consider taking profit above $485.',
      triggerReason: 'Stable recurring enterprise cash flows balancing high Copilot infrastructure capex.',
      trailingStopPercent: 6.0
    },
    ratioStory: 'Microsoft trades at 36.2x current earnings with a solid 29.8x Forward P/E. Price/Book at 12.4x reflects enterprise software moat dominance. Debt/Equity at 0.35 is ultra-safe, yielding 0.72% steady dividend cash return while Azure AI workloads scale.',
    historicalData: generateHistory(448.90, 1.8)
  },
  {
    symbol: 'PLTR',
    name: 'Palantir Technologies Inc.',
    sector: 'AI',
    price: 42.10,
    change24h: -0.85,
    change24hPercent: -1.98,
    low52w: 18.20,
    high52w: 45.80,
    peRatio: 112.5,
    fwdPeRatio: 68.4,
    priceToBook: 18.2,
    pegRatio: 2.85,
    debtToEquity: 0.02,
    dividendYield: 0.00,
    rsi: 74.8,
    macd: { value: 1.45, signal: 1.10, histogram: 0.35 },
    signal: 'SELL',
    whenToSell: {
      targetPrice: 46.00,
      stopLossPrice: 38.50,
      condition: 'Sell or trim position immediately. RSI in overbought zone (74.8) and P/E over 110x.',
      triggerReason: 'Valuation multiple expansion has outpaced short-term commercial AIP revenue delivery.',
      trailingStopPercent: 5.0
    },
    ratioStory: 'Palantir valuation is stretched at 112.5x P/E and 68.4x Forward P/E, with a PEG ratio of 2.85 indicating overbought speculative sentiment. Zero debt is a balance sheet positive, but high Price/Book (18.2) warrants risk reduction near 52-week highs.',
    historicalData: generateHistory(42.10, 4.5)
  },

  // --- DATABASE SECTOR ---
  {
    symbol: 'ORCL',
    name: 'Oracle Corporation',
    sector: 'Database',
    price: 172.40,
    change24h: 4.10,
    change24hPercent: 2.44,
    low52w: 110.20,
    high52w: 178.50,
    peRatio: 41.8,
    fwdPeRatio: 26.5,
    priceToBook: 42.1,
    pegRatio: 1.42,
    debtToEquity: 4.85,
    dividendYield: 0.92,
    rsi: 61.2,
    macd: { value: 3.10, signal: 2.50, histogram: 0.60 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 195.00,
      stopLossPrice: 154.00,
      condition: 'Sell if OCI database backlog growth slows under 20% or leverage spikes past 5.5x.',
      triggerReason: 'Accelerating multi-cloud database partnerships with AWS, Azure, and Google Cloud.',
      trailingStopPercent: 7.5
    },
    ratioStory: 'Oracle shows a classic cloud transformation ratio profile: Forward P/E drops sharply to 26.5x from 41.8x as Autonomous Database & OCI capacity comes online. Higher Debt/Equity (4.85) is mitigated by $90B+ long-term cloud backlog commitments.',
    historicalData: generateHistory(172.40, 2.6)
  },
  {
    symbol: 'SNOW',
    name: 'Snowflake Inc.',
    sector: 'Database',
    price: 128.60,
    change24h: -1.20,
    change24hPercent: -0.92,
    low52w: 107.90,
    high52w: 237.70,
    peRatio: -48.2,
    fwdPeRatio: 145.0,
    priceToBook: 8.4,
    pegRatio: 3.40,
    debtToEquity: 0.00,
    dividendYield: 0.00,
    rsi: 41.5,
    macd: { value: -0.95, signal: -0.70, histogram: -0.25 },
    signal: 'HOLD',
    whenToSell: {
      targetPrice: 155.00,
      stopLossPrice: 112.00,
      condition: 'Hold for rebound to $155. Exit if price breaks below 52-week support ($107.90).',
      triggerReason: 'Consumption-based cloud database usage stabilizing after enterprise cost optimization cycle.',
      trailingStopPercent: 6.5
    },
    ratioStory: 'Snowflake currently trades negative GAAP P/E with a high Forward P/E of 145.0x. However, 0.00 Debt/Equity and $3.5B+ in net cash provide fundamental downside protection while Cortex AI features roll out.',
    historicalData: generateHistory(128.60, 3.8)
  },
  {
    symbol: 'MDB',
    name: 'MongoDB, Inc.',
    sector: 'Database',
    price: 285.30,
    change24h: 6.80,
    change24hPercent: 2.44,
    low52w: 212.50,
    high52w: 509.60,
    peRatio: 124.0,
    fwdPeRatio: 58.2,
    priceToBook: 14.8,
    pegRatio: 1.95,
    debtToEquity: 0.88,
    dividendYield: 0.00,
    rsi: 58.9,
    macd: { value: 1.85, signal: 1.20, histogram: 0.65 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 340.00,
      stopLossPrice: 248.00,
      condition: 'Sell if Atlas consumption growth dips below 22% year-over-year.',
      triggerReason: 'Document database architecture becoming standard for unstructured LLM vector embeddings.',
      trailingStopPercent: 8.0
    },
    ratioStory: 'MongoDB displays improving operational leverage with Forward P/E dropping from 124x to 58.2x. Price/Book (14.8) is historically compressed relative to its 52-week peak ($509.60), presenting a compelling accumulation entry.',
    historicalData: generateHistory(285.30, 3.5)
  },

  // --- ENERGY SECTOR ---
  {
    symbol: 'VST',
    name: 'Vistra Corp.',
    sector: 'Energy',
    price: 124.50,
    change24h: 4.80,
    change24hPercent: 4.01,
    low52w: 34.10,
    high52w: 132.80,
    peRatio: 28.4,
    fwdPeRatio: 18.2,
    priceToBook: 4.8,
    pegRatio: 0.88,
    debtToEquity: 1.92,
    dividendYield: 0.70,
    rsi: 69.2,
    macd: { value: 3.80, signal: 2.90, histogram: 0.90 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 148.00,
      stopLossPrice: 108.00,
      condition: 'Sell if nuclear/gas power purchase agreements (PPAs) with hyperscalers delay past 2026.',
      triggerReason: 'Surging baseload power demand for AI data center infrastructure.',
      trailingStopPercent: 7.0
    },
    ratioStory: 'Vistra is a premier AI energy play. Forward P/E of 18.2x yields an attractive PEG ratio of 0.88 (under-valued relative to earnings growth). The 0.70% dividend is backed by long-term nuclear generation contracts.',
    historicalData: generateHistory(124.50, 4.1)
  },
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    price: 118.20,
    change24h: -0.40,
    change24hPercent: -0.34,
    low52w: 95.70,
    high52w: 126.30,
    peRatio: 14.2,
    fwdPeRatio: 12.8,
    priceToBook: 2.1,
    pegRatio: 1.65,
    debtToEquity: 0.18,
    dividendYield: 3.25,
    rsi: 48.6,
    macd: { value: -0.15, signal: -0.10, histogram: -0.05 },
    signal: 'HOLD',
    whenToSell: {
      targetPrice: 130.00,
      stopLossPrice: 106.00,
      condition: 'Hold as defensive portfolio cash-flow anchor. Sell if Brent crude falls below $62/bbl.',
      triggerReason: 'Strong balance sheet with low 0.18 D/E ratio providing 3.25% reliable dividend yield.',
      trailingStopPercent: 5.5
    },
    ratioStory: 'Exxon Mobil represents fundamental value stability: 14.2x P/E, 12.8x Forward P/E, and low Price/Book (2.1x). Low Debt/Equity (0.18) and a generous 3.25% dividend yield offer excellent volatility hedging against tech market pullbacks.',
    historicalData: generateHistory(118.20, 1.5)
  },
  {
    symbol: 'ENPH',
    name: 'Enphase Energy, Inc.',
    sector: 'Energy',
    price: 88.40,
    change24h: -2.10,
    change24hPercent: -2.32,
    low52w: 70.50,
    high52w: 141.20,
    peRatio: 42.1,
    fwdPeRatio: 28.6,
    priceToBook: 9.2,
    pegRatio: 2.15,
    debtToEquity: 1.45,
    dividendYield: 0.00,
    rsi: 38.2,
    macd: { value: -1.20, signal: -0.80, histogram: -0.40 },
    signal: 'HOLD',
    whenToSell: {
      targetPrice: 112.00,
      stopLossPrice: 76.00,
      condition: 'Sell if inverter sell-through channel inventory fails to clear by Q3.',
      triggerReason: 'Solar microinverter market bottoming out with European demand recovery cues.',
      trailingStopPercent: 8.0
    },
    ratioStory: 'Enphase Forward P/E sits at 28.6x down from 42.1x trailing. RSI of 38.2 indicates oversold cyclical sentiment. Low distance to 52-week low ($70.50) creates an asymmetrical risk/reward ratio.',
    historicalData: generateHistory(88.40, 4.2)
  },

  // --- QUANTUM SECTOR ---
  {
    symbol: 'IONQ',
    name: 'IonQ, Inc.',
    sector: 'Quantum',
    price: 18.75,
    change24h: 1.15,
    change24hPercent: 6.53,
    low52w: 6.80,
    high52w: 22.40,
    peRatio: -18.5,
    fwdPeRatio: -14.2,
    priceToBook: 7.2,
    pegRatio: -1.10,
    debtToEquity: 0.01,
    dividendYield: 0.00,
    rsi: 64.1,
    macd: { value: 0.92, signal: 0.65, histogram: 0.27 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 26.00,
      stopLossPrice: 14.50,
      condition: 'Sell if algorithmic quantum error correction benchmarks miss 2025 roadmap targets.',
      triggerReason: 'Trapped-ion technology achieving superior gate fidelity in commercial cloud deployments.',
      trailingStopPercent: 12.0
    },
    ratioStory: 'IonQ is an early-stage pure play quantum leader. While GAAP earnings remain negative, zero long-term debt (0.01 D/E) and $380M cash runway support multi-year commercial scaling towards #AQ 64 hardware milestones.',
    historicalData: generateHistory(18.75, 6.2)
  },
  {
    symbol: 'IBM',
    name: 'International Business Machines',
    sector: 'Quantum',
    price: 218.60,
    change24h: 2.30,
    change24hPercent: 1.06,
    low52w: 165.20,
    high52w: 232.00,
    peRatio: 23.5,
    fwdPeRatio: 19.8,
    priceToBook: 7.8,
    pegRatio: 2.10,
    debtToEquity: 2.15,
    dividendYield: 3.08,
    rsi: 58.4,
    macd: { value: 1.12, signal: 0.95, histogram: 0.17 },
    signal: 'HOLD',
    whenToSell: {
      targetPrice: 240.00,
      stopLossPrice: 198.00,
      condition: 'Hold for steady 3.08% yield and quantum computing software ecosystem monetization.',
      triggerReason: 'Qiskit software platform dominance paired with steady Red Hat enterprise cloud growth.',
      trailingStopPercent: 5.0
    },
    ratioStory: 'IBM offers a hybrid profile: mature 23.5x P/E with high-yield 3.08% dividend payouts, while maintaining world-leading quantum hardware research (Heron 133-qubit processors). Excellent lower-beta anchor for Quantum portfolios.',
    historicalData: generateHistory(218.60, 2.1)
  },
  {
    symbol: 'QBTS',
    name: 'D-Wave Quantum Inc.',
    sector: 'Quantum',
    price: 1.85,
    change24h: -0.08,
    change24hPercent: -4.15,
    low52w: 0.72,
    high52w: 2.95,
    peRatio: -5.4,
    fwdPeRatio: -4.1,
    priceToBook: 4.1,
    pegRatio: -0.80,
    debtToEquity: 0.42,
    dividendYield: 0.00,
    rsi: 46.2,
    macd: { value: -0.05, signal: -0.02, histogram: -0.03 },
    signal: 'SELL',
    whenToSell: {
      targetPrice: 2.20,
      stopLossPrice: 1.40,
      condition: 'Sell or reduce speculative allocation. High cash burn and potential reverse split risk.',
      triggerReason: 'Quantum annealing niche faces stiff competition from universal gate model quantum systems.',
      trailingStopPercent: 15.0
    },
    ratioStory: 'D-Wave trades at speculative micro-cap levels ($1.85). Negative P/E (-5.4) and ongoing equity dilution necessitate disciplined stop losses and strict position sizing.',
    historicalData: generateHistory(1.85, 8.5)
  },

  // --- CHIPS SECTOR ---
  {
    symbol: 'TSM',
    name: 'Taiwan Semiconductor Mfg.',
    sector: 'Chips',
    price: 188.40,
    change24h: 3.90,
    change24hPercent: 2.11,
    low52w: 112.00,
    high52w: 193.80,
    peRatio: 28.2,
    fwdPeRatio: 21.4,
    priceToBook: 7.1,
    pegRatio: 1.05,
    debtToEquity: 0.28,
    dividendYield: 1.15,
    rsi: 62.8,
    macd: { value: 2.40, signal: 1.95, histogram: 0.45 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 220.00,
      stopLossPrice: 168.00,
      condition: 'Sell if 2nm node production yields falter or geopolitical tariffs exceed 25%.',
      triggerReason: 'Monopolistic dominance in 3nm/2nm foundry node manufacturing for Nvidia, Apple, and AMD.',
      trailingStopPercent: 7.0
    },
    ratioStory: 'TSMC is the indispensable backbone of advanced silicon. A Forward P/E of 21.4x against a PEG of 1.05 represents attractive fundamental pricing for >20% long-term CAGR. Healthy 1.15% dividend backed by strong free cash flow.',
    historicalData: generateHistory(188.40, 2.8)
  },
  {
    symbol: 'AVGO',
    name: 'Broadcom Inc.',
    sector: 'Chips',
    price: 176.10,
    change24h: 2.40,
    change24hPercent: 1.38,
    low52w: 88.20,
    high52w: 185.00,
    peRatio: 68.5,
    fwdPeRatio: 28.9,
    priceToBook: 11.2,
    pegRatio: 1.35,
    debtToEquity: 1.62,
    dividendYield: 1.22,
    rsi: 59.6,
    macd: { value: 1.90, signal: 1.55, histogram: 0.35 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 205.00,
      stopLossPrice: 156.00,
      condition: 'Sell if custom ASIC AI accelerator orders from Google/Meta decline.',
      triggerReason: 'Unrivaled custom AI chip design dominance + VMware enterprise software cross-selling.',
      trailingStopPercent: 6.5
    },
    ratioStory: 'Broadcom exhibits dramatic margin leverage: Forward P/E drops from trailing 68.5x to 28.9x. PEG of 1.35 and 1.22% dividend yield showcase compounding cash flow strength across custom silicon networking.',
    historicalData: generateHistory(176.10, 3.1)
  },
  {
    symbol: 'ASML',
    name: 'ASML Holding N.V.',
    sector: 'Chips',
    price: 742.00,
    change24h: -8.50,
    change24hPercent: -1.13,
    low52w: 638.00,
    high52w: 1056.00,
    peRatio: 38.4,
    fwdPeRatio: 27.2,
    priceToBook: 18.5,
    pegRatio: 1.48,
    debtToEquity: 0.48,
    dividendYield: 0.95,
    rsi: 44.8,
    macd: { value: -3.20, signal: -2.10, histogram: -1.10 },
    signal: 'BUY',
    whenToSell: {
      targetPrice: 910.00,
      stopLossPrice: 660.00,
      condition: 'Sell if EUV tool shipment backlog falls below €30B.',
      triggerReason: 'Monopoly supplier of Extreme Ultraviolet (EUV) lithography machines required for sub-5nm chips.',
      trailingStopPercent: 8.0
    },
    ratioStory: 'ASML is down over 25% from 52-week highs ($1,056), compressing Forward P/E to 27.2x. Sole supplier of EUV photolithography tools worldwide makes this a high-conviction fundamental buy on cyclical weakness.',
    historicalData: generateHistory(742.00, 3.4)
  }
];

export const INITIAL_PAIRS: PairCorrelation[] = [
  {
    id: 'pair-nvda-tsm',
    symbolA: 'NVDA',
    symbolB: 'TSM',
    sectorA: 'AI',
    sectorB: 'Chips',
    pearsonCorrelation: 0.89,
    volatilityA: 38.4,
    volatilityB: 28.1,
    volatilityRatio: 1.37,
    beta: 1.24,
    hedgeRatio: '1.37 : 1.00',
    strategyType: 'Beta Neutral',
    logicDescription: 'NVDA designs AI GPU silicon while TSM fabricates 100% of Hopper/Blackwell wafers. Pearson correlation of r = +0.89 confirms strong co-integration. Using a 1.37:1 ratio allows traders to hedge NVDA foundry supply chain disruption risks via TSM short/long spread pairs.',
    historicalSpread: [
      { date: '2026-06-23', spread: -2.1, zScore: -0.4, priceA: 132.1, priceB: 182.0 },
      { date: '2026-06-30', spread: 1.4, zScore: 0.2, priceA: 134.5, priceB: 183.2 },
      { date: '2026-07-07', spread: 4.8, zScore: 1.1, priceA: 136.8, priceB: 185.0 },
      { date: '2026-07-14', spread: 8.2, zScore: 2.1, priceA: 140.2, priceB: 186.4 },
      { date: '2026-07-21', spread: 3.5, zScore: 0.8, priceA: 138.25, priceB: 188.4 }
    ]
  },
  {
    id: 'pair-vst-xom',
    symbolA: 'VST',
    symbolB: 'XOM',
    sectorA: 'Energy',
    sectorB: 'Energy',
    pearsonCorrelation: -0.28,
    volatilityA: 42.1,
    volatilityB: 16.5,
    volatilityRatio: 2.55,
    beta: 0.45,
    hedgeRatio: '2.55 : 1.00',
    strategyType: 'Cross-Sector Hedge',
    logicDescription: 'VST represents high-beta AI grid power growth (Nuclear/Gas), while XOM is a low-volatility oil cash-flow anchor. The inverse/low correlation (r = -0.28) provides effective downside portfolio volatility dampening during broad market selloffs.',
    historicalSpread: [
      { date: '2026-06-23', spread: 5.2, zScore: 0.8, priceA: 115.0, priceB: 119.2 },
      { date: '2026-06-30', spread: 8.4, zScore: 1.4, priceA: 119.2, priceB: 118.8 },
      { date: '2026-07-07', spread: 12.1, zScore: 2.2, priceA: 122.5, priceB: 118.0 },
      { date: '2026-07-14', spread: 14.8, zScore: 2.6, priceA: 126.0, priceB: 118.5 },
      { date: '2026-07-21', spread: 10.3, zScore: 1.7, priceA: 124.5, priceB: 118.2 }
    ]
  },
  {
    id: 'pair-orcl-snow',
    symbolA: 'ORCL',
    symbolB: 'SNOW',
    sectorA: 'Database',
    sectorB: 'Database',
    pearsonCorrelation: 0.62,
    volatilityA: 26.2,
    volatilityB: 39.8,
    volatilityRatio: 0.66,
    beta: 0.82,
    hedgeRatio: '0.66 : 1.00',
    strategyType: 'Pair Arbitrage',
    logicDescription: 'Measures enterprise database capital shift from multi-cloud infrastructure (ORCL) vs consumption-based data warehousing (SNOW). A current Z-Score of +1.8 suggests ORCL is over-extended relative to SNOW, signaling mean-reversion pair opportunities.',
    historicalSpread: [
      { date: '2026-06-23', spread: 38.5, zScore: 0.2, priceA: 162.0, priceB: 132.0 },
      { date: '2026-06-30', spread: 40.2, zScore: 0.6, priceA: 165.4, priceB: 131.2 },
      { date: '2026-07-07', spread: 42.8, zScore: 1.2, priceA: 168.9, priceB: 130.0 },
      { date: '2026-07-14', spread: 45.1, zScore: 1.8, priceA: 172.4, priceB: 128.6 }
    ]
  },
  {
    id: 'pair-ionq-ibm',
    symbolA: 'IONQ',
    symbolB: 'IBM',
    sectorA: 'Quantum',
    sectorB: 'Quantum',
    pearsonCorrelation: 0.44,
    volatilityA: 65.2,
    volatilityB: 21.0,
    volatilityRatio: 3.10,
    beta: 2.15,
    hedgeRatio: '3.10 : 1.00',
    strategyType: 'Volatility Parity',
    logicDescription: 'High-beta pure play quantum growth (IONQ volatility = 65.2%) paired against low-beta cash dividend incumbent (IBM volatility = 21.0%). Weighting the pair at a 3.1:1 ratio equalizes volatility risk while remaining exposed to breakthrough quantum supremacy milestones.',
    historicalSpread: [
      { date: '2026-06-23', spread: -198.5, zScore: -1.2, priceA: 15.2, priceB: 214.0 },
      { date: '2026-06-30', spread: -197.8, zScore: -0.9, priceA: 16.4, priceB: 215.2 },
      { date: '2026-07-07', spread: -196.2, zScore: -0.4, priceA: 17.8, priceB: 217.0 },
      { date: '2026-07-14', spread: -199.85, zScore: -1.5, priceA: 18.75, priceB: 218.6 }
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    symbol: 'NVDA',
    type: 'BUY',
    shares: 100,
    price: 118.50,
    date: '2026-05-12',
    totalValue: 11850.00,
    notes: 'Accumulated during pull-back before Blackwell node announcements.'
  },
  {
    id: 'tx-102',
    symbol: 'VST',
    type: 'BUY',
    shares: 150,
    price: 88.20,
    date: '2026-05-28',
    totalValue: 13230.00,
    notes: 'Power grid & nuclear PPA positioning.'
  },
  {
    id: 'tx-103',
    symbol: 'TSM',
    type: 'BUY',
    shares: 80,
    price: 152.00,
    date: '2026-06-15',
    totalValue: 12160.00,
    notes: 'Hedge pair for NVDA silicon foundry supply.'
  },
  {
    id: 'tx-104',
    symbol: 'ORCL',
    type: 'BUY',
    shares: 60,
    price: 138.40,
    date: '2026-06-20',
    totalValue: 8304.00,
    notes: 'Autonomous database cloud acceleration entry.'
  },
  {
    id: 'tx-105',
    symbol: 'PLTR',
    type: 'SELL',
    shares: 50,
    price: 43.50,
    date: '2026-07-10',
    totalValue: 2175.00,
    notes: 'Profit taking due to extreme P/E multiple expansion.'
  }
];

export const INITIAL_INDICES: MarketIndex[] = [
  { symbol: 'S&P 500', name: 'S&P 500 Index', value: 5568.40, change: 24.15, changePercent: 0.44 },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', value: 17820.50, change: 112.80, changePercent: 0.64 },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF', value: 228.40, change: 4.80, changePercent: 2.15 },
  { symbol: 'AI INDEX', name: 'AI & Robotics Tech Index', value: 4120.10, change: 68.20, changePercent: 1.68 },
  { symbol: 'QUANTUM', name: 'Global Quantum Index', value: 890.25, change: 28.40, changePercent: 3.29 },
  { symbol: 'CLEAN ENRG', name: 'Energy & Grid Index', value: 1420.80, change: -8.10, changePercent: -0.57 }
];

export const INITIAL_ALERTS: RealTimeAlert[] = [
  {
    id: 'alt-1',
    timestamp: '2 mins ago',
    symbol: 'NVDA',
    title: 'Buy Signal Alert',
    message: 'NVIDIA 14-day RSI (68.4) rebounding from key EMA support with strong volume.',
    type: 'BUY',
    read: false
  },
  {
    id: 'alt-2',
    timestamp: '14 mins ago',
    symbol: 'PLTR',
    title: 'Overbought Warning',
    message: 'Palantir RSI exceeded 74.8 with P/E above 112x. "When to sell" trigger activated.',
    type: 'SELL',
    read: false
  },
  {
    id: 'alt-3',
    timestamp: '45 mins ago',
    symbol: 'NVDA / TSM',
    title: 'Pair Spread Divergence',
    message: 'NVDA/TSM ratio spread reached +2.1 Z-score. Pair arbitrage rebalance opportunity.',
    type: 'PAIR_SPREAD',
    read: false
  }
];
