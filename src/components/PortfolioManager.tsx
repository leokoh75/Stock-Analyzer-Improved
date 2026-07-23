import React, { useState } from 'react';
import { Transaction, PortfolioHolding, Stock } from '../types';
import { PlusCircle, Trash2, TrendingUp, TrendingDown, DollarSign, PieChart, RefreshCw, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';

interface PortfolioManagerProps {
  transactions: Transaction[];
  stocks: Stock[];
  darkMode: boolean;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  transactions,
  stocks,
  darkMode,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [symbol, setSymbol] = useState<string>(stocks[0]?.symbol || 'NVDA');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(10);
  const [price, setPrice] = useState<number>(stocks[0]?.price || 138.25);
  const [notes, setNotes] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingRebalance, setLoadingRebalance] = useState<boolean>(false);

  const getStock = (sym: string) => stocks.find((s) => s.symbol === sym);

  // Calculate Holdings
  const holdingsMap = new Map<string, { shares: number; totalCost: number }>();
  transactions.forEach((tx) => {
    const current = holdingsMap.get(tx.symbol) || { shares: 0, totalCost: 0 };
    if (tx.type === 'BUY') {
      current.shares += tx.shares;
      current.totalCost += tx.shares * tx.price;
    } else {
      current.shares -= tx.shares;
      current.totalCost -= tx.shares * tx.price;
    }
    holdingsMap.set(tx.symbol, current);
  });

  const holdings: PortfolioHolding[] = [];
  let totalPortfolioValue = 0;
  let totalCostBasis = 0;

  holdingsMap.forEach((data, sym) => {
    if (data.shares > 0) {
      const stock = getStock(sym);
      if (stock) {
        const currentValue = data.shares * stock.price;
        const avgPrice = data.totalCost / data.shares;
        const unrealizedGainLoss = currentValue - data.totalCost;
        const unrealizedGainLossPercent = (unrealizedGainLoss / data.totalCost) * 100;

        totalPortfolioValue += currentValue;
        totalCostBasis += data.totalCost;

        holdings.push({
          symbol: stock.symbol,
          name: stock.name,
          sector: stock.sector,
          shares: data.shares,
          avgPrice,
          currentPrice: stock.price,
          currentValue,
          unrealizedGainLoss,
          unrealizedGainLossPercent,
          allocationPercent: 0, // calculated next
          signal: stock.signal,
        });
      }
    }
  });

  // Calculate allocation percentages
  holdings.forEach((h) => {
    h.allocationPercent = totalPortfolioValue > 0 ? (h.currentValue / totalPortfolioValue) * 100 : 0;
  });

  const totalGainLoss = totalPortfolioValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;
  const cashBalance = 25000.00; // Mock cash balance

  // Sector Allocation for Pie Chart
  const sectorMap = new Map<string, number>();
  holdings.forEach((h) => {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.currentValue);
  });
  const pieData = Array.from(sectorMap.entries()).map(([sector, value]) => ({
    name: sector,
    value,
  }));

  const COLORS = ['#10b981', '#38bdf8', '#f59e0b', '#818cf8', '#a855f7'];

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      symbol,
      type,
      shares: Number(shares),
      price: Number(price),
      date: new Date().toISOString().split('T')[0],
      totalValue: Number(shares) * Number(price),
      notes,
    });
    setShowModal(false);
    setNotes('');
  };

  const handleSymbolChange = (sym: string) => {
    setSymbol(sym);
    const stk = getStock(sym);
    if (stk) setPrice(stk.price);
  };

  const fetchRebalanceAdvice = async () => {
    setLoadingRebalance(true);
    try {
      const res = await fetch('/api/ai/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioHoldings: holdings,
          totalValue: totalPortfolioValue,
          cashBalance,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.rebalanceAdvice || 'Rebalance advice generated.');
    } catch (err) {
      setAiAdvice('Failed to generate rebalancing advice.');
    } finally {
      setLoadingRebalance(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Portfolio Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className={`p-5 rounded-2xl border ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-xs text-slate-400 font-mono uppercase">Total Equity Value</span>
          <div className="text-2xl font-black font-mono mt-1 text-slate-100">
            ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Across {holdings.length} Active Holdings
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-xs text-slate-400 font-mono uppercase">Unrealized P&L</span>
          <div className={`text-2xl font-black font-mono mt-1 flex items-center gap-1 ${
            totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {totalGainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className={`text-[11px] font-mono font-bold ${
            totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}% Return
          </span>
        </div>

        <div className={`p-5 rounded-2xl border ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-xs text-slate-400 font-mono uppercase">Available Cash</span>
          <div className="text-2xl font-black font-mono mt-1 text-cyan-400">
            ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Dry Powder Reserve</span>
        </div>

        <div className={`p-5 rounded-2xl border flex items-center justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-xs text-slate-400 font-mono uppercase">Transaction Ledger</span>
            <div className="text-xl font-bold font-mono mt-1 text-slate-200">
              {transactions.length} Executed
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Log Trade
          </button>
        </div>

      </div>

      {/* Main Grid: Holdings Table & Allocation Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Holdings Table */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">
              Current Portfolio Positions
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Cost Basis: ${totalCostBasis.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-2">Asset</th>
                  <th className="py-2 px-2">Shares</th>
                  <th className="py-2 px-2">Avg Price</th>
                  <th className="py-2 px-2">Current</th>
                  <th className="py-2 px-2">Market Value</th>
                  <th className="py-2 px-2">P&L ($ / %)</th>
                  <th className="py-2 px-2">Weight</th>
                  <th className="py-2 px-2">Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {holdings.map((h) => {
                  const isPos = h.unrealizedGainLoss >= 0;
                  return (
                    <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 font-bold text-emerald-400">
                        {h.symbol}
                        <div className="text-[10px] font-normal text-slate-400 truncate max-w-[100px]">{h.name}</div>
                      </td>
                      <td className="py-3 px-2 font-bold">{h.shares}</td>
                      <td className="py-3 px-2">${h.avgPrice.toFixed(2)}</td>
                      <td className="py-3 px-2">${h.currentPrice.toFixed(2)}</td>
                      <td className="py-3 px-2 font-bold">${h.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`py-3 px-2 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}${h.unrealizedGainLoss.toFixed(2)}
                        <div className="text-[10px]">({isPos ? '+' : ''}{h.unrealizedGainLossPercent.toFixed(2)}%)</div>
                      </td>
                      <td className="py-3 px-2 text-slate-300">{h.allocationPercent.toFixed(1)}%</td>
                      <td className="py-3 px-2 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          h.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                          h.signal === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {h.signal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Sector Allocation & Gemini AI Rebalancing */}
        <div className="space-y-6">
          
          {/* Pie Chart */}
          <div className={`p-6 rounded-3xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-400" /> Sector Weight Breakdown
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => `$${Number(val).toLocaleString()}`}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
              {pieData.map((pd, idx) => (
                <div key={pd.name} className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300">{pd.name}:</span>
                  <span className="font-bold text-slate-100">${pd.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Rebalancing Engine */}
          <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Gemini AI Rebalancer
              </span>
              <button
                onClick={fetchRebalanceAdvice}
                disabled={loadingRebalance}
                className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-semibold text-xs hover:bg-emerald-600 transition-all flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loadingRebalance ? 'animate-spin' : ''}`} />
                Analyze
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Request automated quant rebalancing suggestions based on target sector volatility and risk limits.
            </p>

            {aiAdvice && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-100 font-mono whitespace-pre-line animate-fadeIn">
                {aiAdvice}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Historical Transactions Ledger */}
      <div className={`p-6 rounded-3xl border space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
          Historical Transaction Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Symbol</th>
                <th className="py-2 px-3">Shares</th>
                <th className="py-2 px-3">Execution Price</th>
                <th className="py-2 px-3">Total Value</th>
                <th className="py-2 px-3">Notes</th>
                <th className="py-2 px-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 text-slate-400">{tx.date}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      tx.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">{tx.symbol}</td>
                  <td className="py-2.5 px-3 font-bold">{tx.shares}</td>
                  <td className="py-2.5 px-3">${tx.price.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-bold">${tx.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-[200px]">{tx.notes || '—'}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-all"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Record New Transaction
            </h3>

            <form onSubmit={handleSubmitTransaction} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Select Asset Ticker:</label>
                <select
                  value={symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
                >
                  {stocks.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {s.name} (${s.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Type:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="BUY">🟢 BUY</option>
                    <option value="SELL">🔴 SELL</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Number of Shares:</label>
                  <input
                    type="number"
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Execution Price ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Transaction Notes / Strategy Tag:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pair arbitrage hedge entry..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="text-slate-400">Total Transaction Value:</div>
                <div className="text-lg font-bold text-emerald-400">
                  ${(Number(shares) * Number(price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                >
                  Submit Trade Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
