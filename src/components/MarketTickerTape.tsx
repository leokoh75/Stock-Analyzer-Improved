import React from 'react';
import { MarketIndex } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketTickerTapeProps {
  indices: MarketIndex[];
  darkMode: boolean;
}

export const MarketTickerTape: React.FC<MarketTickerTapeProps> = ({ indices, darkMode }) => {
  return (
    <div className={`w-full overflow-x-auto py-2 px-4 border-b text-xs flex items-center gap-6 no-scrollbar whitespace-nowrap select-none ${
      darkMode ? 'bg-slate-950/80 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
    }`}>
      <span className="font-semibold text-[11px] text-slate-500 tracking-wider uppercase flex items-center gap-1 shrink-0">
        Global Indices:
      </span>
      {indices.map((idx) => {
        const isPos = idx.change >= 0;
        return (
          <div key={idx.symbol} className="flex items-center gap-2 shrink-0 font-mono">
            <span className="font-semibold text-slate-400">{idx.symbol}</span>
            <span className="font-bold">{idx.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={`flex items-center gap-0.5 text-[11px] px-1.5 py-0.2 rounded ${
              isPos ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}>
              {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
};
