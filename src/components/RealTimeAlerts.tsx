import React from 'react';
import { RealTimeAlert } from '../types';
import { Bell, Check, TrendingUp, TrendingDown, Layers, AlertCircle } from 'lucide-react';

interface RealTimeAlertsProps {
  alerts: RealTimeAlert[];
  darkMode: boolean;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export const RealTimeAlerts: React.FC<RealTimeAlertsProps> = ({
  alerts,
  darkMode,
  onMarkRead,
  onClearAll,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`p-6 rounded-3xl border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Real-Time Market Alerts</h2>
              <p className="text-xs text-slate-400">
                Automated quant triggers for target prices, RSI extremes, and pair spread divergences.
              </p>
            </div>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Clear All Alerts
            </button>
          )}
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className={`p-8 text-center rounded-3xl border ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-mono">No unread alerts at this time. Market monitor running...</p>
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                alt.type === 'BUY' ? 'bg-emerald-500/10 border-emerald-500/30' :
                alt.type === 'SELL' ? 'bg-rose-500/10 border-rose-500/30' :
                'bg-cyan-500/10 border-cyan-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl border mt-0.5 ${
                  alt.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                  alt.type === 'SELL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                  'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  {alt.type === 'BUY' ? <TrendingUp className="w-4 h-4" /> :
                   alt.type === 'SELL' ? <TrendingDown className="w-4 h-4" /> :
                   <Layers className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{alt.title}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">[{alt.symbol}]</span>
                    <span className="text-[10px] text-slate-400 font-mono">{alt.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alt.message}</p>
                </div>
              </div>

              <button
                onClick={() => onMarkRead(alt.id)}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-all"
                title="Mark as Read"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
