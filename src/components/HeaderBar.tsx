import React from 'react';
import { Activity, ShieldCheck, Lock, Moon, Sun, Smartphone, Monitor, Bell, TrendingUp } from 'lucide-react';

interface HeaderBarProps {
  activeTab: 'watchlist' | 'pairs' | 'portfolio' | 'alerts';
  setActiveTab: (tab: 'watchlist' | 'pairs' | 'portfolio' | 'alerts') => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean) => void;
  unreadAlertsCount: number;
  liveFeedActive: boolean;
  setLiveFeedActive: (val: boolean) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  activeTab,
  setActiveTab,
  isMobileFrame,
  setIsMobileFrame,
  darkMode,
  setDarkMode,
  isLocked,
  setIsLocked,
  unreadAlertsCount,
  liveFeedActive,
  setLiveFeedActive,
}) => {
  return (
    <header className={`border-b sticky top-0 z-40 transition-colors ${
      darkMode ? 'bg-[#161B22] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Market Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-600/30">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-lg text-white">
                  QUANTUM<span className="text-indigo-400">TRADE</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE MARKET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Quantitative Hedging & Correlation Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'watchlist'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Watchlist & Screener
            </button>
            <button
              onClick={() => setActiveTab('pairs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'pairs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Pair Correlations
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'portfolio'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Portfolio & Ledger
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                activeTab === 'alerts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Real-time Alerts
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            
            {/* Live Feed Toggle Button */}
            <button
              onClick={() => setLiveFeedActive(!liveFeedActive)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all ${
                liveFeedActive
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Live Market Feed Price Ticks"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${liveFeedActive ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{liveFeedActive ? 'Feed Active' : 'Feed Paused'}</span>
            </button>

            {/* Frame Switcher (Desktop vs Mobile Preview) */}
            <button
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
                isMobileFrame
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                  : darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title={isMobileFrame ? "Switch to Full Desktop Layout" : "Switch to Mobile Device Frame Preview"}
            >
              {isMobileFrame ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              <span className="hidden lg:inline text-xs">{isMobileFrame ? 'Mobile Frame' : 'Desktop View'}</span>
            </button>

            {/* Dark/Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg border text-xs transition-all ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Dark / Light Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Biometric Security Lock Button */}
            <button
              onClick={() => setIsLocked(true)}
              className={`p-2 rounded-lg border text-xs transition-all flex items-center gap-1.5 ${
                isLocked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
              }`}
              title="Lock with Biometric / PIN Protection"
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">{isLocked ? 'Locked' : 'Secured'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`px-3 py-1 rounded-md ${
              activeTab === 'watchlist' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Screener
          </button>
          <button
            onClick={() => setActiveTab('pairs')}
            className={`px-3 py-1 rounded-md ${
              activeTab === 'pairs' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Pairs
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1 rounded-md ${
              activeTab === 'portfolio' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1 rounded-md relative ${
              activeTab === 'alerts' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400'
            }`}
          >
            Alerts
            {unreadAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {unreadAlertsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
