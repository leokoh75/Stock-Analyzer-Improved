import React, { useState } from 'react';
import { Stock, Sector, ActionSignal } from '../types';
import { Search, Filter, TrendingUp, TrendingDown, ArrowUpDown, Sparkles, AlertCircle, Eye, PlusCircle, Layers } from 'lucide-react';

interface WatchlistScreenerProps {
  stocks: Stock[];
  darkMode: boolean;
  onSelectStock: (stock: Stock) => void;
  onAddTransaction: (symbol: string) => void;
  onViewPairsForStock: (symbol: string) => void;
}

export const WatchlistScreener: React.FC<WatchlistScreenerProps> = ({
  stocks,
  darkMode,
  onSelectStock,
  onAddTransaction,
  onViewPairsForStock,
}) => {
  const [selectedSector, setSelectedSector] = useState<Sector | 'ALL'>('ALL');
  const [selectedSignal, setSelectedSignal] = useState<ActionSignal | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'pe' | 'fwdPe' | 'rsi' | 'sector' | 'volatility'>('change');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  const sectors: (Sector | 'ALL')[] = ['ALL', 'AI', 'Database', 'Energy', 'Quantum', 'Chips'];

  // Filtering logic
  const filteredStocks = stocks.filter((s) => {
    const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;
    const matchesSignal = selectedSignal === 'ALL' || s.signal === selectedSignal;
    const matchesQuery =
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSignal && matchesQuery;
  });

  // Sorting logic
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    switch (sortBy) {
      case 'price':
        valA = a.price;
        valB = b.price;
        break;
      case 'change':
        valA = a.change24hPercent;
        valB = b.change24hPercent;
        break;
      case 'pe':
        valA = a.peRatio;
        valB = b.peRatio;
        break;
      case 'fwdPe':
        valA = a.fwdPeRatio;
        valB = b.fwdPeRatio;
        break;
      case 'rsi':
        valA = a.rsi;
        valB = b.rsi;
        break;
      case 'volatility':
        valA = a.stdDevAnnualized;
        valB = b.stdDevAnnualized;
        break;
      case 'sector':
        return sortOrder === 'asc' ? a.sector.localeCompare(b.sector) : b.sector.localeCompare(a.sector);
      default:
        valA = a.change24hPercent;
        valB = b.change24hPercent;
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSignalBadge = (signal: ActionSignal) => {
    switch (signal) {
      case 'BUY':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">🟢 BUY</span>;
      case 'SELL':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">🔴 SELL</span>;
      case 'HOLD':
        return <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">🟡 HOLD</span>;
    }
  };

  const getSectorColor = (sec: Sector) => {
    switch (sec) {
      case 'AI': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'Database': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Energy': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Quantum': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Chips': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Screener Controls Header */}
      <div className={`p-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-[#161B22] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Sector Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sector:
            </span>
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedSector === sec
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : darkMode
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec === 'ALL' ? '🌐 All Sectors' : sec === 'AI' ? '🤖 AI Tech' : sec === 'Database' ? '💾 Database' : sec === 'Energy' ? '⚡ Energy' : sec === 'Quantum' ? '⚛️ Quantum' : '🔌 Chips'}
              </button>
            ))}
          </div>

          {/* Search, Action Filter, View Toggle */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol or name..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none transition-all ${
                  darkMode
                    ? 'bg-[#0D1117] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Signal Filter */}
            <select
              value={selectedSignal}
              onChange={(e) => setSelectedSignal(e.target.value as any)}
              className={`py-1.5 px-3 text-xs rounded-xl border outline-none font-medium cursor-pointer ${
                darkMode ? 'bg-[#0D1117] border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="ALL">All Signals</option>
              <option value="BUY">🟢 BUY Only</option>
              <option value="HOLD">🟡 HOLD Only</option>
              <option value="SELL">🔴 SELL Only</option>
            </select>

            {/* View Mode Toggle (Table vs Cards) */}
            <div className={`flex items-center p-1 rounded-xl border ${
              darkMode ? 'bg-[#0D1117] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stock List View */}
      {viewMode === 'table' ? (
        <div className={`rounded-2xl border overflow-hidden shadow-xl transition-all ${
          darkMode ? 'bg-[#161B22] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-mono text-[10px] font-bold uppercase tracking-wider ${
                  darkMode ? 'bg-[#0D1117] border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <th className="py-3 px-4">Asset / Sector</th>
                  <th className="py-3 px-3 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('price')}>
                    <div className="flex items-center gap-1">Price <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('change')}>
                    <div className="flex items-center gap-1">24h Change <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('volatility')}>
                    <div className="flex items-center gap-1">Volatility (σ_ann) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3 px-4 min-w-[140px]">52-Week Range</th>
                  <th className="py-3 px-3 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('pe')}>
                    <div className="flex items-center gap-1">P/E (Fwd) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3 px-3">Sharpe</th>
                  <th className="py-3 px-3 cursor-pointer hover:text-indigo-400" onClick={() => toggleSort('rsi')}>
                    <div className="flex items-center gap-1">RSI (14) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="py-3 px-3">Action Signal</th>
                  <th className="py-3 px-4">When To Sell Target</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {sortedStocks.map((stock) => {
                  const isPos = stock.change24h >= 0;
                  const rangePercent = Math.min(
                    Math.max(((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100, 0),
                    100
                  );

                  return (
                    <tr
                      key={stock.symbol}
                      className={`hover:bg-slate-800/20 transition-colors group cursor-pointer ${
                        darkMode ? 'text-slate-200' : 'text-slate-800'
                      }`}
                      onClick={() => onSelectStock(stock)}
                    >
                      {/* Asset & Sector */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-sm text-white tracking-tight group-hover:text-indigo-400 transition-colors">
                            {stock.symbol}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono border font-semibold ${getSectorColor(stock.sector)}`}>
                            {stock.sector}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {stock.name}
                        </div>
                      </td>

                      {/* Current Price */}
                      <td className="py-3 px-3 font-mono font-bold text-sm">
                        ${stock.price.toFixed(2)}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3 px-3 font-mono">
                        <div className={`inline-flex items-center gap-1 font-bold ${
                          isPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {isPos ? '+' : ''}{stock.change24hPercent.toFixed(2)}%
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isPos ? '+' : ''}${stock.change24h.toFixed(2)}
                        </div>
                      </td>

                      {/* Volatility Standard Deviation Column */}
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                          stock.stdDevAnnualized > 40 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          stock.stdDevAnnualized > 25 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {stock.stdDevAnnualized.toFixed(1)}%
                        </span>
                        <div className="text-[9px] text-slate-500">±{stock.stdDevDaily.toFixed(2)}%/day</div>
                      </td>

                      {/* 52-Week Range Spectrum */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                          <span>${stock.low52w.toFixed(1)}</span>
                          <span className="text-slate-500 font-sans">52W</span>
                          <span>${stock.high52w.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden relative border border-slate-700/50">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${rangePercent}%` }}
                          />
                        </div>
                      </td>

                      {/* P/E vs Forward P/E */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold">{stock.peRatio > 0 ? `${stock.peRatio}x` : 'N/A'}</div>
                        <div className="text-[10px] text-indigo-400">Fwd: {stock.fwdPeRatio > 0 ? `${stock.fwdPeRatio}x` : 'N/A'}</div>
                      </td>

                      {/* Sharpe Ratio */}
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                        {stock.sharpeRatio.toFixed(2)}
                      </td>

                      {/* RSI Indicator */}
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          stock.rsi > 70 ? 'bg-rose-500/20 text-rose-400' : stock.rsi < 40 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {stock.rsi.toFixed(1)}
                        </span>
                      </td>

                      {/* Action Signal */}
                      <td className="py-3 px-3">
                        {getSignalBadge(stock.signal)}
                      </td>

                      {/* When To Sell Target */}
                      <td className="py-3 px-4 text-xs">
                        <div className="font-semibold text-amber-400 flex items-center gap-1">
                          Target: ${stock.whenToSell.targetPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]" title={stock.whenToSell.condition}>
                          Stop: ${stock.whenToSell.stopLossPrice.toFixed(2)} • {stock.whenToSell.condition}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStock(stock)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                            title="View Deep Ratio Story & Charts"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewPairsForStock(stock.symbol)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                            title="View Pair Trend Correlation & Hedging"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onAddTransaction(stock.symbol)}
                            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                            title="Record Buy/Sell Transaction"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStocks.map((stock) => {
            const isPos = stock.change24h >= 0;
            const rangePercent = Math.min(
              Math.max(((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100, 0),
              100
            );

            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 space-y-4 ${
                  darkMode ? 'bg-[#161B22] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold text-white tracking-tight">{stock.symbol}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono border font-semibold ${getSectorColor(stock.sector)}`}>
                        {stock.sector}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-[180px]">{stock.name}</p>
                  </div>
                  {getSignalBadge(stock.signal)}
                </div>

                {/* Price & Change */}
                <div className="flex items-baseline justify-between border-b border-slate-800/60 pb-3 font-mono">
                  <div>
                    <span className="text-2xl font-black">${stock.price.toFixed(2)}</span>
                  </div>
                  <div className={`text-sm font-bold flex items-center gap-1 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPos ? '+' : ''}{stock.change24hPercent.toFixed(2)}%
                  </div>
                </div>

                {/* Ratios Breakdown */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs bg-[#0D1117] p-2.5 rounded-xl border border-slate-800/60">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">P/E</div>
                    <div className="font-bold">{stock.peRatio > 0 ? `${stock.peRatio}x` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Fwd P/E</div>
                    <div className="font-bold text-indigo-400">{stock.fwdPeRatio > 0 ? `${stock.fwdPeRatio}x` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">P / Book</div>
                    <div className="font-bold">{stock.priceToBook}x</div>
                  </div>
                </div>

                {/* 52-Week Spectrum */}
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Low: ${stock.low52w.toFixed(2)}</span>
                    <span className="text-slate-500">52W Range</span>
                    <span>High: ${stock.high52w.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative border border-slate-700/50">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${rangePercent}%` }}
                    />
                  </div>
                </div>

                {/* When to Sell Guidance */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="font-semibold text-amber-400 flex items-center justify-between">
                    <span>When To Sell:</span>
                    <span>Target: ${stock.whenToSell.targetPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {stock.whenToSell.condition}
                  </p>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-1 text-xs" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectStock(stock)}
                    className="flex items-center gap-1 text-indigo-400 hover:underline font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Ratio Story
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewPairsForStock(stock.symbol)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold hover:bg-slate-700"
                    >
                      Pairs
                    </button>
                    <button
                      onClick={() => onAddTransaction(stock.symbol)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                    >
                      + Trade
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
