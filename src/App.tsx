import React, { useState, useEffect } from 'react';
import { Stock, PairCorrelation, Transaction, MarketIndex, RealTimeAlert } from './types';
import {
  INITIAL_STOCKS,
  INITIAL_PAIRS,
  INITIAL_TRANSACTIONS,
  INITIAL_INDICES,
  INITIAL_ALERTS,
} from './data/mockData';
import { HeaderBar } from './components/HeaderBar';
import { MarketTickerTape } from './components/MarketTickerTape';
import { WatchlistScreener } from './components/WatchlistScreener';
import { StockDetailModal } from './components/StockDetailModal';
import { PairHedgingMatrix } from './components/PairHedgingMatrix';
import { PortfolioManager } from './components/PortfolioManager';
import { RealTimeAlerts } from './components/RealTimeAlerts';
import { GoalPlanner } from './components/GoalPlanner';
import { BiometricModal } from './components/BiometricModal';
import { Smartphone, Monitor, ShieldCheck, Wifi, Battery, Signal } from 'lucide-react';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [pairs, setPairs] = useState<PairCorrelation[]>(INITIAL_PAIRS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [indices, setIndices] = useState<MarketIndex[]>(INITIAL_INDICES);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>(INITIAL_ALERTS);

  const [activeTab, setActiveTab] = useState<'watchlist' | 'pairs' | 'portfolio' | 'alerts' | 'goal'>('watchlist');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [liveFeedActive, setLiveFeedActive] = useState<boolean>(true);

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [pairFilterSymbol, setPairFilterSymbol] = useState<string | null>(null);

  // Live Price Feed Simulator
  useEffect(() => {
    if (!liveFeedActive) return;

    const interval = setInterval(() => {
      setStocks((prevStocks) => {
        return prevStocks.map((stk) => {
          if (Math.random() > 0.4) {
            const changePct = (Math.random() - 0.49) * 0.008; // small price fluctuation
            const newPrice = Number(Math.max(stk.price * (1 + changePct), 1).toFixed(2));
            const change24h = Number((newPrice - (stk.price - stk.change24h)).toFixed(2));
            const change24hPercent = Number(((change24h / (newPrice - change24h)) * 100).toFixed(2));
            
            // Subtle RSI adjustment
            let newRsi = Number(Math.min(Math.max(stk.rsi + (changePct * 200), 15), 88).toFixed(1));

            return {
              ...stk,
              price: newPrice,
              change24h,
              change24hPercent,
              rsi: newRsi,
            };
          }
          return stk;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [liveFeedActive]);

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenTransactionForSymbol = (symbol: string) => {
    setActiveTab('portfolio');
  };

  const handleViewPairsForStock = (symbol: string) => {
    setPairFilterSymbol(symbol);
    setActiveTab('pairs');
  };

  const handleMarkAlertRead = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAllAlerts = () => {
    setAlerts([]);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const appContent = (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-[#0A0B0E] text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Header Bar */}
      <HeaderBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        unreadAlertsCount={unreadAlertsCount}
        liveFeedActive={liveFeedActive}
        setLiveFeedActive={setLiveFeedActive}
      />

      {/* Market Ticker Tape */}
      <MarketTickerTape indices={indices} darkMode={darkMode} />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'watchlist' && (
          <WatchlistScreener
            stocks={stocks}
            darkMode={darkMode}
            onSelectStock={(s) => setSelectedStock(s)}
            onAddTransaction={handleOpenTransactionForSymbol}
            onViewPairsForStock={handleViewPairsForStock}
          />
        )}

        {activeTab === 'goal' && (
          <GoalPlanner
            stocks={stocks}
            darkMode={darkMode}
            onSelectStock={(s) => setSelectedStock(s)}
            onAddTransaction={handleOpenTransactionForSymbol}
          />
        )}

        {activeTab === 'pairs' && (
          <PairHedgingMatrix
            pairs={pairs}
            stocks={stocks}
            darkMode={darkMode}
            filterSymbol={pairFilterSymbol}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioManager
            transactions={transactions}
            stocks={stocks}
            darkMode={darkMode}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'alerts' && (
          <RealTimeAlerts
            alerts={alerts}
            darkMode={darkMode}
            onMarkRead={handleMarkAlertRead}
            onClearAll={handleClearAllAlerts}
          />
        )}
      </main>

      {/* Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        darkMode={darkMode}
        onAddTransaction={handleOpenTransactionForSymbol}
      />

      {/* Biometric Security Lock Screen */}
      <BiometricModal
        isOpen={isLocked}
        onUnlock={() => setIsLocked(false)}
        darkMode={darkMode}
      />
    </div>
  );

  // If Mobile Device Frame view mode is selected, wrap in sleek Smartphone Mockup
  if (isMobileFrame) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
        
        {/* Frame Toggle Controls Banner */}
        <div className="mb-4 flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-2xl text-xs text-slate-300">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Mobile Device App Preview Active</span>
          <button
            onClick={() => setIsMobileFrame(false)}
            className="ml-2 px-3 py-1 rounded-xl bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-all flex items-center gap-1"
          >
            <Monitor className="w-3.5 h-3.5" /> Full Desktop View
          </button>
        </div>

        {/* iPhone / Android Mockup Chassis */}
        <div className="w-full max-w-[420px] h-[850px] bg-slate-950 border-[10px] border-slate-800 rounded-[50px] shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
          
          {/* Dynamic Island / Speaker Notch */}
          <div className="w-full h-8 bg-slate-950 flex items-center justify-between px-6 shrink-0 text-[11px] font-mono text-slate-300 z-50 select-none pt-1">
            <span>09:41</span>
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Device Screen Content */}
          <div className="flex-1 overflow-y-auto relative no-scrollbar">
            {appContent}
          </div>

          {/* Home Indicator Bar */}
          <div className="w-full h-5 bg-slate-950 flex items-center justify-center shrink-0 z-50">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>

        </div>
      </div>
    );
  }

  return appContent;
}
