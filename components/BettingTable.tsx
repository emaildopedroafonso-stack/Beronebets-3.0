
import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, Sport } from '../types';
import FeedItem from './FeedItem';

interface BettingTableProps {
  nbaData: PlayerProfile[];
  footballData: PlayerProfile[];
  currentDate: string;
  onDateChange: (date: string) => void;
  onPlayerClick: (p: PlayerProfile) => void;
  onToggleSave: (e: React.MouseEvent, p: PlayerProfile) => void;
  savedIds: string[];
}

const BettingTable: React.FC<BettingTableProps> = ({ 
  nbaData, 
  footballData, 
  currentDate, 
  onDateChange,
  onPlayerClick,
  onToggleSave,
  savedIds
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate dates: -3 to +3 days
  const generateDates = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        val: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        day: d.getDate()
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Group data by Matchup
  const groupData = (data: PlayerProfile[]) => {
    const groups: Record<string, PlayerProfile[]> = {};
    data.forEach(p => {
      const key = p.matchup || "Outros Jogos";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  };

  const nbaGroups = groupData(nbaData);
  const footballGroups = groupData(footballData);

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="sticky top-[50px] z-20 bg-[#0f1012]/95 backdrop-blur pt-2 pb-2 border-b border-zinc-800">
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
          {dates.map((d) => {
            const isSelected = d.val === currentDate;
            const isToday = d.val === new Date().toISOString().split('T')[0];
            return (
              <button
                key={d.val}
                onClick={() => onDateChange(d.val)}
                className={`flex flex-col items-center justify-center min-w-[50px] h-14 rounded-xl border transition-all ${isSelected ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-[#1e1e1e] border-zinc-800 text-zinc-400'}`}
              >
                <span className="text-[10px] font-bold">{isToday ? 'HOJE' : d.label}</span>
                <span className={`text-lg font-black ${isSelected ? 'text-black' : 'text-white'}`}>{d.day}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-8 pb-12">
        {/* NBA Matches */}
        {Object.keys(nbaGroups).length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏀</span>
                <h3 className="text-white font-bold text-lg">NBA</h3>
             </div>
             {Object.entries(nbaGroups).map(([match, players]) => (
               <MatchGroup 
                 key={match} 
                 title={match} 
                 players={players} 
                 onPlayerClick={onPlayerClick}
                 onToggleSave={onToggleSave}
                 savedIds={savedIds}
               />
             ))}
          </div>
        )}

        {/* Football Matches */}
        {Object.keys(footballGroups).length > 0 && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚽</span>
                <h3 className="text-white font-bold text-lg">Futebol</h3>
             </div>
             {Object.entries(footballGroups).map(([match, players]) => (
               <MatchGroup 
                 key={match} 
                 title={match} 
                 players={players} 
                 onPlayerClick={onPlayerClick}
                 onToggleSave={onToggleSave}
                 savedIds={savedIds}
               />
             ))}
          </div>
        )}

        {nbaData.length === 0 && footballData.length === 0 && (
           <div className="text-center py-10 opacity-50">
              <p>Nenhuma aposta de alta probabilidade encontrada para esta data.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const MatchGroup: React.FC<{ 
  title: string, 
  players: PlayerProfile[],
  onPlayerClick: any,
  onToggleSave: any,
  savedIds: string[]
}> = ({ title, players, onPlayerClick, onToggleSave, savedIds }) => {
  return (
    <div className="bg-[#161616] rounded-xl border border-zinc-800 overflow-hidden">
       <div className="bg-[#262626] px-4 py-3 flex items-center justify-between border-b border-zinc-700">
          <span className="text-white font-bold text-sm">{title}</span>
          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{players.length} Opções</span>
       </div>
       <div className="p-3 space-y-3">
          {players.map(p => (
            <FeedItem 
              key={p.id} 
              profile={p} 
              onClick={() => onPlayerClick(p)}
              isSaved={savedIds.includes(p.id)}
              onToggleSave={(e) => onToggleSave(e, p)}
            />
          ))}
       </div>
    </div>
  )
}

export default BettingTable;
