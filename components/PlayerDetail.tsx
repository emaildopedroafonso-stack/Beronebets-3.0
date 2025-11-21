
import React from 'react';
import { PlayerProfile } from '../types';

interface PlayerDetailProps {
  profile: PlayerProfile;
  onBack: () => void;
}

const PlayerDetail: React.FC<PlayerDetailProps> = ({ profile, onBack }) => {
  return (
    <div className="min-h-full bg-[#121212] flex flex-col">
      {/* Header with Back Button */}
      <div className="p-4 flex items-center gap-4 sticky top-0 bg-[#121212]/95 backdrop-blur z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-zinc-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-white font-bold">Detalhes do Jogador</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4">
        {/* Player Header Card */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-zinc-800 flex items-center gap-6 mb-6">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-4 border-[#121212] shadow-xl flex items-center justify-center text-4xl relative">
              {profile.name.substring(0,1)}
              <div className="absolute -bottom-2 bg-zinc-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700">
                {profile.position}
              </div>
           </div>
           <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                 <p className="text-zinc-400 text-sm">{profile.team}</p>
              </div>
           </div>
        </div>

        {/* Season Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
           {profile.seasonStats.map((stat, idx) => (
             <div key={idx} className="bg-[#1e1e1e] rounded-xl p-3 border border-zinc-800 flex flex-col items-center justify-center text-center">
                <span className="text-zinc-500 text-[10px] uppercase font-bold mb-1 h-8 flex items-center">{stat.label}</span>
                <span className="text-white text-xl font-black">{stat.value}</span>
                {stat.trend && (
                  <span className={`text-[10px] font-bold ${stat.trend.includes('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.trend}</span>
                )}
             </div>
           ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
           <button className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-yellow-500/20">Streaks</button>
           <button className="bg-zinc-800 text-zinc-400 px-6 py-2 rounded-full font-bold text-sm border border-zinc-700">Notícias</button>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 mb-4">
           <button className="bg-yellow-500/20 text-yellow-500 px-4 py-1 rounded-full text-xs font-bold border border-yellow-500/30">Atuais</button>
           <button className="text-zinc-500 px-4 py-1 rounded-full text-xs font-bold hover:text-zinc-300">Históricas</button>
        </div>

        {/* Active Streaks List */}
        <div className="space-y-3">
           {profile.streaks.map((streak) => (
             <div key={streak.id} className="bg-[#1e1e1e] p-4 rounded-xl border border-zinc-800 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${streak.metric === 'Points' ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-400'}`}>
                      {streak.metric === 'Points' ? '🔥' : '📊'}
                   </div>
                   <div>
                      <h4 className="text-white font-bold text-sm">{streak.title}</h4>
                      <p className="text-zinc-500 text-[10px]">Ativa | Início: {streak.startDate}</p>
                   </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-zinc-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
