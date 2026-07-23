import React, { useState } from 'react';
import { PairCorrelation, Stock } from '../types';
import { Layers, Activity, TrendingUp, ShieldCheck, ArrowRight, HelpCircle, BarChart3, Calculator } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PairHedgingMatrixProps {
  pairs: PairCorrelation[];
  stocks: Stock[];
  darkMode: boolean;
  filterSymbol?: string | null;
}

export const PairHedgingMatrix: React.FC<PairHedgingMatrixProps> = ({
  pairs,
  stocks,
  darkMode,
  filterSymbol,
}) => {
  const [selectedPairId, setSelectedPairId] = useState<string>(pairs[0]?.id || '');
  const [customPositionA, setCustomPositionA] = useState<number>(10000);

  const displayedPairs = filterSymbol
    ? pairs.filter((p) => p.symbolA === filterSymbol || p.symbolB === filterSymbol)
    : pairs;

  const activePair = pairs.find((p) => p.id === selectedPairId) || pairs[0];

  const getStock = (sym: string) => stocks.find((s) => s.symbol === sym);

  const getPearsonBadge = (r: number) => {
    if (r >= 0.7) {
      return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">r = +{r.toFixed(2)} (High Correlation)</span>;
    } else if (r <= -0.2) {
      return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">r = {r.toFixed(2)} (Inverse Hedge)</span>;
    } else {
      return <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">r = +{r.toFixed(2)} (Moderate)</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Explanation Banner */}
      <div className={`p-6 rounded-3xl border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" /> Quantitative Hedging Engine
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Sector Pair Correlations & Volatility Parity
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Utilizing Pearson correlation coefficients ($r$) and annualized volatility ratios ($\sigma_A / \sigma_B$) to calculate optimal hedge positions, neutralize beta exposures, and manage cross-sector drawdowns.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">Pearson Formula</div>
              <div className="font-bold text-emerald-400">r = Cov(A,B) / (σ_A × σ_B)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pair List & Spread Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Pair List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Active Hedging Pairs ({displayedPairs.length})
          </h3>

          {displayedPairs.map((pair) => {
            const stockA = getStock(pair.symbolA);
            const stockB = getStock(pair.symbolB);
            const isSelected = pair.id === activePair?.id;

            return (
              <div
                key={pair.id}
                onClick={() => setSelectedPairId(pair.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-emerald-500/50 ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono font-black text-base text-emerald-400">
                    <span>{pair.symbolA}</span>
                    <span className="text-slate-500 text-xs font-normal">vs</span>
                    <span>{pair.symbolB}</span>
                  </div>
                  {getPearsonBadge(pair.pearsonCorrelation)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/40 p-2 rounded-xl border border-slate-800/60 mb-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Vol Ratio (σ)</span>
                    <span className="font-bold text-slate-200">{pair.volatilityRatio.toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Hedge Ratio</span>
                    <span className="font-bold text-cyan-400">{pair.hedgeRatio}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-amber-400">{pair.strategyType}</span>
                  <span>Beta: {pair.beta}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Pair Detail & Spread Chart */}
        {activePair && (
          <div className={`lg:col-span-2 p-6 rounded-3xl border space-y-6 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {activePair.symbolA} / {activePair.symbolB}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {activePair.strategyType}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Sector Pairing: <span className="text-slate-200">{activePair.sectorA}</span> + <span className="text-slate-200">{activePair.sectorB}</span>
                </p>
              </div>

              <div className="font-mono text-right">
                <div className="text-xs text-slate-400">Pearson Correlation (r)</div>
                <div className="text-2xl font-black text-emerald-400">
                  {activePair.pearsonCorrelation > 0 ? '+' : ''}{activePair.pearsonCorrelation.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Historical Pair Spread Chart */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Historical Price Spread Divergence ($)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Z-Score Threshold: <span className="text-amber-400 font-bold">±2.0 (Arbitrage Signal)</span>
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activePair.historicalSpread}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="spread" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volatility Coefficient Breakdown & Logic Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Volatility Coefficient Comparison
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{activePair.symbolA} Volatility (σ_A):</span>
                  <span className="font-bold text-amber-400">{activePair.volatilityA}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">{activePair.symbolB} Volatility (σ_B):</span>
                  <span className="font-bold text-cyan-400">{activePair.volatilityB}%</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Volatility Parity Ratio:</span>
                  <span className="font-bold text-emerald-400">{activePair.volatilityRatio.toFixed(2)} : 1.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Recommended Hedge Ratio:</span>
                  <span className="font-bold text-emerald-400">{activePair.hedgeRatio}</span>
                </div>
              </div>

              {/* Calculator Simulator */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                <div className="font-bold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
                  Hedge Position Calculator
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Primary Position Size in {activePair.symbolA} ($):
                  </label>
                  <input
                    type="number"
                    value={customPositionA}
                    onChange={(e) => setCustomPositionA(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-mono">
                  <div className="text-[10px] text-slate-400">Calculated Hedge Requirement in {activePair.symbolB}:</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    ${(customPositionA * activePair.volatilityRatio).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

            </div>

            {/* Strategic Logic Description */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Quantitative Selection Logic
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {activePair.logicDescription}
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
