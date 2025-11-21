import React, { useState } from 'react';
import { BettingOpportunity, Sport } from '../types';

interface BettingTableProps {
  data: BettingOpportunity[];
}

interface GroupedMatch {
  sport: Sport;
  competition: string;
  match: string;
  items: BettingOpportunity[];
}

const BettingTable: React.FC<BettingTableProps> = ({ data }) => {
  const [historyLimit, setHistoryLimit] = useState<number>(5);
  const [sportFilter, setSportFilter] = useState<string>('ALL');

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-[#1e1e1e] rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-4 mt-4">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center text-3xl grayscale opacity-50">📉</div>
        <div>
           <h3 className="text-white font-bold text-lg">Sem dados para esta data</h3>
           <p className="text-zinc-400 text-sm mt-2 max-w-xs mx-auto">
             Tente mudar a data no topo ou verifique outra liga.
           </p>
        </div>
      </div>
    );
  }

  const getLineFromMetric = (metric: string): { value: number | null, type: 'OVER' | 'UNDER' | null } => {
    const lower = metric.toLowerCase();
    const match = lower.match(/(\d+(\.\d+)?)/);
    let type: 'OVER' | 'UNDER' | null = null;
    if (lower.includes('over') || lower.includes('mais') || lower.includes('>')) type = 'OVER';
    if (lower.includes('under') || lower.includes('menos') || lower.includes('<')) type = 'UNDER';
    if (!type) type = 'OVER';
    return { value: match ? parseFloat(match[0]) : null, type };
  };

  const getStatBadge = (metric: string, sport: Sport) => {
    const m = metric.toLowerCase();
    if (sport === Sport.NBA) {
      if (m.includes('point') || m.includes('ponto') || m.includes('pts')) return { label: 'PTS', className: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
      if (m.includes('assist')) return { label: 'AST', className: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' };
      if (m.includes('rebound') || m.includes('rebote')) return { label: 'REB', className: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
      if (m.includes('three') || m.includes('3')) return { label: '3PM', className: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
      if (m.includes('steal') || m.includes('roubo')) return { label: 'STL', className: 'text-teal-400 border-teal-500/30 bg-teal-500/10' };
      if (m.includes('block') || m.includes('toco')) return { label: 'BLK', className: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10' };
    }
    if (m.includes('goal') || m.includes('gol')) return { label: 'GOL', className: 'text-green-400 border-green-500/30 bg-green-500/10' };
    if (m.includes('shot') || m.includes('chute')) return { label: 'CHUTE', className: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' };
    if (m.includes('corner') || m.includes('escanteio')) return { label: 'CANTO', className: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    if (m.includes('card') || m.includes('cart')) return { label: 'CARD', className: 'text-red-400 border-red-500/30 bg-red-500/10' };
    if (m.includes('tackle') || m.includes('desarme')) return { label: 'DES', className: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: 'STAT', className: 'text-zinc-400 border-zinc-600 bg-zinc-800' };
  };

  const filteredData = sportFilter === 'ALL' 
    ? data 
    : data.filter(item => sportFilter === 'NBA' ? item.sport === Sport.NBA : item.sport === Sport.FOOTBALL);

  // Group by match
  const groupedData = filteredData.reduce((acc: Record<string, GroupedMatch>, item) => {
    const key = `${item.sport}-${item.match}`;
    if (!acc[key]) {
      acc[key] = {
        sport: item.sport,
        competition: item.competition,
        match: item.match,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-12">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="relative">
           <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="appearance-none bg-[#262626] text-white text-xs font-bold border border-zinc-700 rounded pl-3 pr-8 py-2 focus:border-red-600"
           >
             <option value="ALL">Todos</option>
             <option value="NBA">NBA</option>
             <option value="FUTEBOL">Futebol</option>
           </select>
        </div>

        <div className="flex items-center bg-[#262626] rounded border border-zinc-700 p-0.5">
          <button onClick={() => setHistoryLimit(5)} className={`px-3 py-1 rounded text-[10px] font-bold ${historyLimit === 5 ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}>5 Jogos</button>
          <button onClick={() => setHistoryLimit(10)} className={`px-3 py-1 rounded text-[10px] font-bold ${historyLimit === 10 ? 'bg-zinc-600 text-white' : 'text-zinc-500'}`}>10 Jogos</button>
        </div>
      </div>

      {Object.values(groupedData).map((group: GroupedMatch, groupIdx) => {
        // Sort items: GOLD items first
        const sortedItems = [...group.items].sort((a, b) => (b.isGold ? 1 : 0) - (a.isGold ? 1 : 0));
        const playerItems = sortedItems.filter(i => i.type !== 'TEAM');
        const teamItems = sortedItems.filter(i => i.type === 'TEAM');

        return (
        <div key={groupIdx} className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-zinc-800 shadow-lg relative">
          <div className="bg-[#2d2d2d] px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className={`w-1 h-8 rounded-full ${group.sport === Sport.NBA ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{group.competition}</span>
                  <h3 className="text-sm font-bold text-white leading-tight">{group.match}</h3>
               </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-500">{group.sport}</span>
          </div>

          {teamItems.length > 0 && (
            <div className="border-b border-zinc-800">
              <div className="px-4 py-1 bg-zinc-900/80 text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">🛡️ Time</div>
              <div className="divide-y divide-zinc-800">
                 {teamItems.map((item, idx) => (
                    <BetItemRow key={`t-${idx}`} item={item} historyLimit={historyLimit} getLine={getLineFromMetric} getBadge={getStatBadge} />
                 ))}
              </div>
            </div>
          )}

          {playerItems.length > 0 && (
            <div>
              {teamItems.length > 0 && <div className="px-4 py-1 bg-zinc-900/80 text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2">👤 Jogadores</div>}
              <div className="divide-y divide-zinc-800">
                {playerItems.map((item, idx) => (
                   <BetItemRow key={`p-${idx}`} item={item} historyLimit={historyLimit} getLine={getLineFromMetric} getBadge={getStatBadge} />
                ))}
              </div>
            </div>
          )}
        </div>
      )})}
    </div>
  );
};

const BetItemRow: React.FC<{
  item: BettingOpportunity;
  historyLimit: number;
  getLine: (m: string) => any;
  getBadge: (m: string, s: Sport) => any;
}> = ({ item, historyLimit, getLine, getBadge }) => {
   const [copied, setCopied] = useState(false);
   const { value: lineValue, type: lineType } = getLine(item.metric);
   const badge = getBadge(item.metric, item.sport);
   
   let visibleValues: (number | string)[] = [];
   const parsedNums = (item.last10GamesRaw || "").split(/[\s,]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));

   if (parsedNums.length > 0) {
     visibleValues = parsedNums.slice(0, historyLimit);
   } else {
     const [hits, total] = item.consistency.split('/').map(s => parseInt(s));
     if (!isNaN(hits) && !isNaN(total)) {
        visibleValues = Array(Math.min(total, historyLimit)).fill('?');
     }
   }

   const handleBetClick = () => {
      // Texto otimizado para busca
      const text = `${item.player} ${item.metric}`;
      navigator.clipboard.writeText(text).then(() => {
         setCopied(true);
         // Abre Bet365 (Link Genérico pois não existe deep link direto para aposta)
         window.open('https://www.bet365.com', '_blank');
         setTimeout(() => setCopied(false), 3000);
      });
   };

   return (
     <div className={`p-4 transition-colors relative ${item.isGold ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : 'hover:bg-[#262626]'}`}>
        {item.isGold && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
        )}
        
        <div className="flex flex-col gap-3">
           <div className="flex justify-between items-start">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${item.isGold ? 'text-yellow-100' : 'text-white'}`}>{item.player}</span>
                    {item.isGold && <span className="text-xs" title="BetBerone Gold: Alta Consistência">🏆</span>}
                 </div>
                 <div className="flex flex-wrap gap-2 mt-1">
                     <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase ${badge.className}`}>{badge.label}</span>
                     {item.h2hInfo && <span className="text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">VS: {item.h2hInfo}</span>}
                 </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                 <div className={`px-2 py-1 rounded border ${item.isGold ? 'bg-yellow-500 text-black border-yellow-400 font-black' : 'bg-zinc-800 text-yellow-500 border-yellow-500/30 font-bold'} text-sm shadow-sm`}>
                    {item.metric}
                 </div>
              </div>
           </div>

           {/* History Row */}
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121212] p-2 rounded border border-zinc-800/50">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-zinc-500 uppercase">Form:</span>
                <div className="flex gap-1">
                    {visibleValues.map((val, i) => {
                        let color = "bg-zinc-800 text-zinc-500 border-zinc-700";
                        if (val === '?') color = "bg-emerald-600 text-white"; 
                        else if (typeof val === 'number' && lineValue !== null) {
                            const hit = lineType === 'OVER' ? val > lineValue : val < lineValue;
                            color = hit ? "bg-emerald-500 text-black font-bold border-emerald-400" : "bg-red-900/30 text-red-400 border-red-900";
                        }
                        return (
                            <div key={i} className={`w-6 h-6 flex items-center justify-center rounded text-xs border ${color}`}>
                                {val}
                            </div>
                        )
                    })}
                </div>
              </div>

              <button 
                onClick={handleBetClick}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1 ${copied ? 'bg-emerald-600 text-white' : 'bg-[#383838] hover:bg-[#4a4a4a] text-zinc-300 border border-zinc-600'}`}
              >
                 {copied ? (
                    <>✅ Copiado!</>
                 ) : (
                    <>
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       Apostar na Bet365
                    </>
                 )}
              </button>
           </div>
           
           {item.trend && (
               <div className="flex items-start gap-1.5 text-[10px] text-zinc-400 bg-zinc-900/50 p-1.5 rounded">
                  <span>🔥</span>
                  <span className="leading-tight">{item.trend}</span>
               </div>
           )}
        </div>
     </div>
   );
};

export default BettingTable;