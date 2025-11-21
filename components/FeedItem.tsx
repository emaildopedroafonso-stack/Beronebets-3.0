
import React from 'react';
import { PlayerProfile } from '../types';

interface FeedItemProps {
  profile: PlayerProfile;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: (e: React.MouseEvent) => void;
}

const FeedItem: React.FC<FeedItemProps> = ({ profile, onClick, isSaved, onToggleSave }) => {
  const mainStreak = profile.streaks[0]; // Primary streak

  // Calculate consistency percentage based on history if available
  const calculateConsistency = () => {
    if (!mainStreak?.history) return 0;
    const threshold = parseFloat(mainStreak.value || "0");
    // Simple heuristic: assume history values > threshold means a hit
    const hits = mainStreak.history.filter(h => h > threshold).length;
    return Math.round((hits / mainStreak.history.length) * 100);
  };

  const consistency = calculateConsistency();

  return (
    <div onClick={onClick} className="bg-[#1e1e1e] rounded-xl p-0 border border-zinc-800 active:scale-[0.98] transition-all cursor-pointer shadow-md overflow-hidden group">
      {/* Top Strip - League/Team */}
      <div className="bg-[#262626] px-4 py-2 flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{profile.team}</span>
          </div>
          <button onClick={onToggleSave} className="text-zinc-500 hover:text-yellow-500 transition-colors">
             {isSaved ? (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-500">
                 <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
               </svg>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
               </svg>
             )}
          </button>
      </div>

      <div className="p-4 flex gap-4">
        {/* Left: Avatar & Info */}
        <div className="flex-1 flex items-center gap-3">
           <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl border border-zinc-700 text-zinc-500 font-bold">
              {profile.name.charAt(0)}
           </div>
           <div>
              <h3 className="text-white font-bold text-base leading-tight">{profile.name}</h3>
              <p className="text-zinc-500 text-xs font-medium">{profile.position} • {mainStreak?.metric}</p>
           </div>
        </div>

        {/* Right: Big Stat */}
        <div className="flex flex-col items-end justify-center">
           <div className="flex items-baseline gap-1">
              <span className="text-zinc-500 text-xs font-bold">Linha</span>
              <span className="text-white font-black text-xl">{mainStreak?.value}</span>
           </div>
           <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
              OVER
           </div>
        </div>
      </div>

      {/* Bottom: Analysis/Streak */}
      {mainStreak && (
        <div className="bg-[#161616] px-4 py-3 border-t border-zinc-800/50 flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Últimos Jogos</span>
               <div className="flex gap-1">
                  {mainStreak.history.slice(0, 8).map((val, idx) => {
                     const isHit = val > parseFloat(mainStreak.value);
                     return (
                        <div key={idx} className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${isHit ? 'bg-emerald-500 text-black' : 'bg-red-900/40 text-red-500 border border-red-900'}`}>
                           {val}
                        </div>
                     )
                  })}
               </div>
            </div>
            
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-zinc-500 uppercase font-bold">Consistência</span>
               <div className="flex items-center gap-1 text-emerald-400 font-black text-lg">
                  {consistency > 0 ? `${consistency}%` : '🔥'}
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FeedItem;
