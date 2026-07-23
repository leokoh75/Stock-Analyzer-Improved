import React, { useState } from 'react';
import { Stock } from '../types';
import { X, Sparkles, TrendingUp, TrendingDown, ShieldAlert, ArrowRight, DollarSign, Activity, Target, Clock, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
  darkMode: boolean;
  onAddTransaction: (symbol: string) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  darkMode,
  onAddTransaction,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'price' | 'rsi'>('price');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  if (!stock) return null;

  const isPos = stock.change24h >= 0;
  const rangePercent = Math.min(
    Math.max(((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100, 0),
    100
  );

  const fetchAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          price: stock.price,
          peRatio: stock.peRatio,
          fwdPeRatio: stock.fwdPeRatio,
          priceToBook: stock.priceToBook,
          rsi: stock.rsi,
          low52w: stock.low52w,
          high52w: stock.high52w,
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.analysis || 'Analysis generated.');
    } catch (err) {
      setAiAnalysis('Failed to generate AI analysis. Please verify server setup.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-8 ${
        darkMode ? 'bg-[#161B22] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Modal Top Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          darkMode ? 'border-slate-800 bg-[#0D1117]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-white tracking-tight">{stock.symbol}</span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                {stock.sector} Sector
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                stock.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                stock.signal === 'SELL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}>
                SIGNAL: {stock.signal}
              </span>
            </div>
            <h2 className="text-sm font-medium text-slate-400 mt-1">{stock.name}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddTransaction(stock.symbol)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" /> Log Transaction
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Price & 52-Week Range Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className={`p-4 rounded-2xl border ${
              darkMode ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-xs text-slate-400 font-mono uppercase">Current Spot Price</div>
              <div className="text-3xl font-black font-mono mt-1">${stock.price.toFixed(2)}</div>
              <div className={`text-xs font-bold font-mono mt-1 flex items-center gap-1 ${
                isPos ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPos ? '+' : ''}{stock.change24hPercent.toFixed(2)}% (${stock.change24h.toFixed(2)})
              </div>
            </div>

            {/* 52-Week Range Spectrum Gauge */}
            <div className={`p-4 rounded-2xl border md:col-span-2 ${
              darkMode ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-slate-400">52-Week Range Spectrum</span>
                <span className="font-bold text-indigo-400">{rangePercent.toFixed(1)}% of 52W High</span>
              </div>
              <div className="flex justify-between text-xs font-mono font-bold mb-1">
                <span className="text-rose-400">Low: ${stock.low52w.toFixed(2)}</span>
                <span className="text-indigo-400">Current: ${stock.price.toFixed(2)}</span>
                <span className="text-cyan-400">High: ${stock.high52w.toFixed(2)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden relative border border-slate-700">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${rangePercent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Interactive Recharts Chart */}
          <div className={`p-4 rounded-2xl border ${
            darkMode ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Historical Price & RSI Momentum Chart
                </span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveChartTab('price')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeChartTab === 'price' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Price ($)
                </button>
                <button
                  onClick={() => setActiveChartTab('rsi')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeChartTab === 'rsi' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  RSI (14)
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeChartTab === 'price' ? (
                  <AreaChart data={stock.historicalData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                ) : (
                  <LineChart data={stock.historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="rsi" stroke="#38bdf8" strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ratios Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Trailing P/E</div>
              <div className="text-base font-bold text-slate-100">{stock.peRatio > 0 ? `${stock.peRatio}x` : 'N/A'}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Forward P/E</div>
              <div className="text-base font-bold text-indigo-400">{stock.fwdPeRatio > 0 ? `${stock.fwdPeRatio}x` : 'N/A'}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Price / Book</div>
              <div className="text-base font-bold text-cyan-400">{stock.priceToBook}x</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">PEG Ratio</div>
              <div className="text-base font-bold text-amber-400">{stock.pegRatio}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Debt / Equity</div>
              <div className="text-base font-bold text-slate-100">{stock.debtToEquity}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">Dividend Yield</div>
              <div className="text-base font-bold text-emerald-400">{(stock.dividendYield * 100).toFixed(2)}%</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">14-Day RSI</div>
              <div className="text-base font-bold text-indigo-400">{stock.rsi}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800 text-center">
              <div className="text-[10px] text-slate-400 uppercase">MACD Hist</div>
              <div className="text-base font-bold text-cyan-400">{stock.macd.histogram}</div>
            </div>
          </div>

          {/* EXPLICIT "WHEN TO SELL" ACTION GUIDANCE BOX */}
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-amber-300 uppercase tracking-wide">
                  When To Sell Strategy & Trigger Rules
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Trailing Stop: {stock.whenToSell.trailingStopPercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Take Profit Target</span>
                <span className="text-lg font-bold text-emerald-400">${stock.whenToSell.targetPrice.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D1117] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Hard Stop Loss</span>
                <span className="text-lg font-bold text-rose-400">${stock.whenToSell.stopLossPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-200">Specific Trigger Condition:</span>
              <p className="text-slate-300 leading-relaxed bg-[#0D1117]/80 p-3 rounded-xl border border-slate-800">
                {stock.whenToSell.condition}
              </p>
            </div>
          </div>

          {/* FUNDAMENTAL RATIO NARRATIVE STORY */}
          <div className="p-5 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Fundamental Ratio Story
                </h3>
              </div>
              <button
                onClick={fetchAiAnalysis}
                disabled={loadingAi}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                {loadingAi ? 'Analyzing Gemini...' : 'Ask Gemini AI Story'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {stock.ratioStory}
            </p>

            {aiAnalysis && (
              <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-100 space-y-2 animate-fadeIn font-mono whitespace-pre-line">
                <div className="font-bold text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Gemini Server-Side Quant Intelligence:
                </div>
                {aiAnalysis}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
