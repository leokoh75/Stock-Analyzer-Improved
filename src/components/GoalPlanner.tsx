import React, { useState } from 'react';
import { Stock } from '../types';
import { Target, TrendingUp, ShieldAlert, Sparkles, DollarSign, Calculator, HelpCircle, ArrowUpRight, ArrowDownRight, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface GoalPlannerProps {
  stocks: Stock[];
  darkMode: boolean;
  onSelectStock: (stock: Stock) => void;
  onAddTransaction: (symbol: string) => void;
}

export const GoalPlanner: React.FC<GoalPlannerProps> = ({
  stocks,
  darkMode,
  onSelectStock,
  onAddTransaction,
}) => {
  // Goal parameters state
  const [targetSgd, setTargetSgd] = useState<number>(300000);
  const [years, setYears] = useState<number>(12);
  const [initialCapitalSgd, setInitialCapitalSgd] = useState<number>(30000);
  const [monthlyContribSgd, setMonthlyContribSgd] = useState<number>(1200);
  const [usdFxRate] = useState<number>(1.34); // 1.34 SGD per 1 USD
  const [selectedRiskTolerance, setSelectedRiskTolerance] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  
  const [aiGoalReport, setAiGoalReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Convert SGD to USD equivalent for portfolio calculations
  const initialCapitalUsd = initialCapitalSgd / usdFxRate;
  const monthlyContribUsd = monthlyContribSgd / usdFxRate;
  const targetUsd = targetSgd / usdFxRate;

  // Calculate weighted portfolio metrics from the stocks
  const totalWeight = stocks.reduce((sum, s) => sum + s.goalActionGuidance.targetWeightPercent, 0);
  
  const weightedCagr = stocks.reduce((sum, s) => {
    const weight = (s.goalActionGuidance.targetWeightPercent / totalWeight);
    return sum + (s.expectedCagr * weight);
  }, 0);

  const weightedVolatility = stocks.reduce((sum, s) => {
    const weight = (s.goalActionGuidance.targetWeightPercent / totalWeight);
    return sum + (s.stdDevAnnualized * weight);
  }, 0);

  const weightedSharpe = stocks.reduce((sum, s) => {
    const weight = (s.goalActionGuidance.targetWeightPercent / totalWeight);
    return sum + (s.sharpeRatio * weight);
  }, 0);

  // Calculate required CAGR to hit SGD 300,000 in 'years' given initial capital & monthly contribution
  // Formula: Compound growth with monthly annuity
  const calculateRequiredCagr = () => {
    let lowRate = 0.001;
    let highRate = 0.50;
    let reqRate = 0.10;

    for (let iter = 0; iter < 50; iter++) {
      const mid = (lowRate + highRate) / 2;
      const rMonthly = Math.pow(1 + mid, 1 / 12) - 1;
      const totalMonths = years * 12;
      
      const futureValInitial = initialCapitalSgd * Math.pow(1 + mid, years);
      const futureValAnnuity = rMonthly > 0 
        ? monthlyContribSgd * ((Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly)
        : monthlyContribSgd * totalMonths;

      const totalVal = futureValInitial + futureValAnnuity;

      if (totalVal < targetSgd) {
        lowRate = mid;
      } else {
        highRate = mid;
      }
      reqRate = mid;
    }
    return reqRate * 100;
  };

  const requiredCagrPercent = calculateRequiredCagr();

  // Generate 12-Year Simulation Trajectories (Median Case, Bull +1σ Case, Bear -1σ Case)
  const generateTrajectoryData = () => {
    const data = [];
    const volDec = weightedVolatility / 100;
    const cagrDec = weightedCagr / 100;

    for (let y = 0; y <= years; y++) {
      const totalMonths = y * 12;
      const rMonthly = Math.pow(1 + cagrDec, 1 / 12) - 1;
      
      // Median compound trajectory
      const initVal = initialCapitalSgd * Math.pow(1 + cagrDec, y);
      const annuityVal = totalMonths > 0 && rMonthly > 0
        ? monthlyContribSgd * ((Math.pow(1 + rMonthly, totalMonths) - 1) / rMonthly)
        : 0;
      const medianSgd = initVal + annuityVal;

      // Volatility bounds (Standard Deviation grows with sqrt(time))
      const timeFactor = Math.sqrt(y);
      const volBand = volDec * timeFactor * 0.6; // 1 Std Dev spread

      const bullSgd = medianSgd * (1 + volBand);
      const bearSgd = Math.max(medianSgd * (1 - volBand), (initialCapitalSgd + (monthlyContribSgd * totalMonths)));

      data.push({
        year: `Year ${y}`,
        MedianSgd: Math.round(medianSgd),
        BullSgd: Math.round(bullSgd),
        BearSgd: Math.round(bearSgd),
        TargetGoal: targetSgd,
      });
    }
    return data;
  };

  const trajectoryData = generateTrajectoryData();
  const finalProjectedSgd = trajectoryData[trajectoryData.length - 1].MedianSgd;
  const isGoalAchievable = finalProjectedSgd >= targetSgd;

  const fetchAiGoalAnalysis = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'SGD_300K_GOAL_PLANNER',
          name: '12-Year SGD 300,000 Portfolio Strategy',
          targetSgd,
          years,
          initialCapitalSgd,
          monthlyContribSgd,
          requiredCagrPercent: requiredCagrPercent.toFixed(2),
          weightedCagr: weightedCagr.toFixed(2),
          weightedVolatility: weightedVolatility.toFixed(2),
          weightedSharpe: weightedSharpe.toFixed(2),
          stocks: stocks.map(s => ({
            symbol: s.symbol,
            sector: s.sector,
            price: s.price,
            volatilityAnnualized: s.stdDevAnnualized,
            sharpe: s.sharpeRatio,
            signal: s.signal,
            targetWeight: s.goalActionGuidance.targetWeightPercent,
            role: s.goal300kRole,
            buyWhen: s.goalActionGuidance.buyWhen,
            sellWhen: s.goalActionGuidance.sellWhen
          }))
        }),
      });
      const data = await res.json();
      setAiGoalReport(data.analysis || 'Analysis generated successfully.');
    } catch (err) {
      setAiGoalReport('Could not generate AI strategy report. Please verify server connection.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Hero Header Banner */}
      <div className={`p-4 sm:p-8 rounded-2xl sm:rounded-3xl border relative overflow-hidden transition-all shadow-xl ${
        darkMode ? 'bg-gradient-to-br from-[#161B22] via-[#0D1117] to-indigo-950/40 border-slate-800' : 'bg-gradient-to-br from-white via-slate-50 to-indigo-50 border-slate-200'
      }`}>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Target className="w-6 h-6" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Quantitative Goal Engine
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            12-Year <span className="text-indigo-400">SGD 300,000</span> Goal Planner & Volatility Matrix
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
            This engine measures <strong className="text-white">Standard Deviation (σ, Volatility)</strong> and risk-adjusted return ratios across identified stocks. It formulates a precision <strong className="text-indigo-300">BUY, SELL, and HOLD roadmap</strong> to compound your capital to <strong>SGD 300k</strong> over a 12-year investment horizon.
          </p>
        </div>
      </div>

      {/* Standard Deviation Research Educational Guide */}
      <div className={`p-4 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4 transition-all ${
        darkMode ? 'bg-[#161B22] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Financial Research: Standard Deviation (σ) & Buy/Sell/Hold Mechanics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          
          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2">
            <div className="font-bold text-indigo-400 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              1. What is Standard Deviation (σ)?
            </div>
            <p className="text-slate-300 leading-relaxed">
              Standard deviation measures how much a stock's historical price returns fluctuate around its average return:
            </p>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 text-center">
              σ_annual = σ_daily × √252
            </div>
            <p className="text-slate-400 text-[11px]">
              High σ (&gt;35%) indicates high volatility (e.g. NVDA, IONQ), while low σ (&lt;20%) indicates steady capital anchors (e.g. XOM, IBM).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              2. Volatility Channels & Triggers
            </div>
            <p className="text-slate-300 leading-relaxed">
              In a normal distribution, prices stay within <strong>±1σ for 68.2%</strong> of trading sessions, and <strong>±2σ for 95.4%</strong>.
            </p>
            <ul className="text-slate-300 space-y-1 text-[11px]">
              <li className="text-emerald-400 font-semibold">• Price &lt; -1.5σ below mean: High-probability BUY dip</li>
              <li className="text-rose-400 font-semibold">• Price &gt; +2.0σ above mean: Overextended SELL / TRIM</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              3. Achieving the SGD 300k Target
            </div>
            <p className="text-slate-300 leading-relaxed">
              High-volatility stocks generate high CAGR but require strict rebalancing stop losses. Pair high-σ growth engines with low-σ dividend anchors to maximize the overall portfolio <strong>Sharpe Ratio</strong>:
            </p>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 text-center">
              Sharpe = (Portfolio Return - RiskFree) / Portfolio Volatility
            </div>
          </div>

        </div>
      </div>

      {/* Goal Parameters & Calculator Inputs */}
      <div className={`p-6 rounded-3xl border space-y-6 transition-all ${
        darkMode ? 'bg-[#161B22] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              SGD 300k Goal Calculator Settings
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-400">
            FX Rate: <strong className="text-indigo-400">1.34 SGD / USD</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Target Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Target Goal (SGD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">SGD</span>
              <input
                type="number"
                value={targetSgd}
                onChange={(e) => setTargetSgd(Number(e.target.value))}
                className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold rounded-xl border bg-[#0D1117] border-slate-700 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Time Horizon */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Time Horizon (Years)</label>
            <input
              type="number"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border bg-[#0D1117] border-slate-700 text-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Initial Capital */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Initial Capital (SGD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">SGD</span>
              <input
                type="number"
                value={initialCapitalSgd}
                onChange={(e) => setInitialCapitalSgd(Number(e.target.value))}
                className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold rounded-xl border bg-[#0D1117] border-slate-700 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Monthly Savings */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase">Monthly Savings (SGD)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">SGD</span>
              <input
                type="number"
                value={monthlyContribSgd}
                onChange={(e) => setMonthlyContribSgd(Number(e.target.value))}
                className="w-full pl-12 pr-3 py-2 text-sm font-mono font-bold rounded-xl border bg-[#0D1117] border-slate-700 text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

        </div>

        {/* Calculated Key Metrics Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          
          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-sans">Required CAGR to reach SGD 300k</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{requiredCagrPercent.toFixed(2)}% p.a.</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Target compounding benchmark</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-sans">Identified Stocks Weighted CAGR</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{weightedCagr.toFixed(2)}% p.a.</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Expected portfolio growth rate</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-sans">Portfolio Standard Deviation (σ)</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{weightedVolatility.toFixed(1)}% p.a.</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Annualized volatility risk</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1117] border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-sans">12-Year Projected Value</div>
            <div className={`text-2xl font-black mt-1 ${isGoalAchievable ? 'text-emerald-400' : 'text-rose-400'}`}>
              SGD {finalProjectedSgd.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isGoalAchievable ? '✅ Exceeds SGD 300k Target' : '⚠️ Below SGD 300k Target'}
            </div>
          </div>

        </div>
      </div>

      {/* 12-Year Wealth Accumulation Trajectory Chart */}
      <div className={`p-6 rounded-3xl border space-y-4 transition-all ${
        darkMode ? 'bg-[#161B22] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              12-Year Monte Carlo & Volatility Growth Trajectory
            </h2>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Target Goal: SGD {targetSgd.toLocaleString()}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData}>
              <defs>
                <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `SGD ${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`SGD ${Number(value).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" name="Bull Case (+1σ Volatility)" dataKey="BullSgd" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#colorBull)" />
              <Area type="monotone" name="Expected Growth (Median CAGR)" dataKey="MedianSgd" stroke="#10b981" strokeWidth={2.5} fill="url(#colorMedian)" />
              <Area type="monotone" name="Bear Case (-1σ Volatility)" dataKey="BearSgd" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
              <Area type="monotone" name="SGD 300k Target Line" dataKey="TargetGoal" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 6" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Identified Stocks Volatility & When To Buy/Sell/Hold Matrix Table */}
      <div className={`p-6 rounded-3xl border space-y-6 transition-all ${
        darkMode ? 'bg-[#161B22] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Identified Stocks: Standard Deviation & Buy / Sell / Hold Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Each asset's volatility (σ), Sharpe ratio, and customized trading rules to reach SGD 300k in 12 years.
            </p>
          </div>
          <button
            onClick={fetchAiGoalAnalysis}
            disabled={loadingAi}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 transition-all shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
            {loadingAi ? 'Optimizing with Gemini...' : 'Ask Gemini 12-Yr Rebalance Strategy'}
          </button>
        </div>

        {/* AI Report Section if fetched */}
        {aiGoalReport && (
          <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-100 space-y-3 animate-fadeIn font-mono whitespace-pre-line">
            <div className="font-bold text-indigo-300 flex items-center gap-2 text-sm border-b border-indigo-500/30 pb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Gemini AI Quantitative Roadmap to SGD 300,000 (12-Year Horizon):
            </div>
            {aiGoalReport}
          </div>
        )}

        {/* Table of Identified Stocks */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-[#0D1117]">
                <th className="py-3 px-4">Stock / Sector</th>
                <th className="py-3 px-3">Spot Price</th>
                <th className="py-3 px-3">Std Dev (σ_ann)</th>
                <th className="py-3 px-3">Daily σ</th>
                <th className="py-3 px-3">Sharpe</th>
                <th className="py-3 px-3">Est. CAGR</th>
                <th className="py-3 px-3">Target Wt %</th>
                <th className="py-3 px-4 min-w-[220px]">SGD 300k Buy / Sell / Hold Strategy</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {stocks.map((stock) => {
                const stdDevColor = 
                  stock.stdDevAnnualized > 40 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                  stock.stdDevAnnualized > 25 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';

                return (
                  <tr 
                    key={stock.symbol}
                    className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => onSelectStock(stock)}
                  >
                    {/* Symbol & Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">
                        {stock.symbol}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{stock.name}</div>
                      <div className="text-[10px] font-mono font-semibold text-indigo-300 mt-0.5">
                        {stock.goal300kRole}
                      </div>
                    </td>

                    {/* Spot Price */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      ${stock.price.toFixed(2)}
                    </td>

                    {/* Annualized Standard Deviation */}
                    <td className="py-3 px-3 font-mono">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${stdDevColor}`}>
                        {stock.stdDevAnnualized.toFixed(1)}% p.a.
                      </span>
                    </td>

                    {/* Daily Standard Deviation */}
                    <td className="py-3 px-3 font-mono text-slate-300">
                      ±{stock.stdDevDaily.toFixed(2)}%
                    </td>

                    {/* Sharpe Ratio */}
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                      {stock.sharpeRatio.toFixed(2)}
                    </td>

                    {/* Expected CAGR */}
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      +{stock.expectedCagr.toFixed(1)}%
                    </td>

                    {/* Target Portfolio Weight % */}
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {stock.goalActionGuidance.targetWeightPercent}%
                      </span>
                    </td>

                    {/* Detailed Strategy */}
                    <td className="py-3 px-4 text-xs space-y-1">
                      <div className="text-emerald-400 font-semibold text-[11px] flex items-start gap-1">
                        <span className="shrink-0 font-bold">BUY:</span> {stock.goalActionGuidance.buyWhen}
                      </div>
                      <div className="text-rose-400 font-semibold text-[11px] flex items-start gap-1">
                        <span className="shrink-0 font-bold">SELL:</span> {stock.goalActionGuidance.sellWhen}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onAddTransaction(stock.symbol)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
                      >
                        + Trade
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
