
import React, { useState, useEffect } from 'react';
import { fetchHomeFeed } from './services/geminiService';
import FeedItem from './components/FeedItem';
import PlayerDetail from './components/PlayerDetail';
import BettingTable from './components/BettingTable';
import { HomeFeedData, PlayerProfile } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'bets' | 'profile'>('home');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [feedData, setFeedData] = useState<HomeFeedData | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [savedBets, setSavedBets] = useState<PlayerProfile[]>([]);

  useEffect(() => {
    loadData(currentDate);
  }, [currentDate]);

  const loadData = async (date: string) => {
    setLoading(true);
    const data = await fetchHomeFeed('AMBOS', date);
    setFeedData(data);
    setLoading(false);
  };

  // Handlers
  const handlePlayerClick = (profile: PlayerProfile) => {
    setSelectedPlayer(profile);
  };

  const handleBack = () => {
    setSelectedPlayer(null);
  };

  const toggleSaveBet = (e: React.MouseEvent, profile: PlayerProfile) => {
    e.stopPropagation();
    const exists = savedBets.find(p => p.id === profile.id);
    if (exists) {
      setSavedBets(savedBets.filter(p => p.id !== profile.id));
    } else {
      setSavedBets([...savedBets, profile]);
    }
  };

  // Render Content based on Active Tab
  const renderContent = () => {
    if (activeTab === 'bets') {
      return (
        <section className="px-4 space-y-4 pb-24 pt-4 min-h-screen">
           <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-white">Minhas Apostas Salvas</h2>
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{savedBets.length}</span>
           </div>
           {savedBets.length === 0 ? (
             <div className="text-center py-20 opacity-50 flex flex-col items-center">
               <div className="text-5xl mb-4 grayscale">📌</div>
               <p className="text-zinc-400 text-sm">Nenhuma aposta salva ainda.</p>
               <button onClick={() => setActiveTab('home')} className="mt-4 text-yellow-500 text-sm font-bold">Ir para o Feed</button>
             </div>
           ) : (
             savedBets.map(p => (
               <FeedItem 
                 key={p.id} 
                 profile={p} 
                 onClick={() => handlePlayerClick(p)} 
                 isSaved={true}
                 onToggleSave={(e) => toggleSaveBet(e, p)}
               />
             ))
           )}
        </section>
      );
    }

    if (activeTab === 'profile') {
      return (
        <section className="px-4 py-10 text-center min-h-screen flex flex-col items-center">
           <div className="w-24 h-24 bg-zinc-800 rounded-full mb-6 flex items-center justify-center text-4xl border-4 border-zinc-700 shadow-xl">
             👤
           </div>
           <h2 className="text-white font-bold text-2xl">Perfil do Apostador</h2>
           <div className="mt-auto mb-24 text-xs text-zinc-600">
              BeroneBets v3.0
           </div>
        </section>
      );
    }

    // HOME TAB
    if (loading && !feedData) {
       return (
         <div className="flex flex-col items-center justify-center py-20 h-[60vh]">
           <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-zinc-500 text-sm font-medium animate-pulse">Analisando mercado para {currentDate}...</p>
         </div>
       );
    }

    return (
       <div className="min-h-screen pb-24">
         <BettingTable 
            nbaData={feedData?.topStreaksNBA || []}
            footballData={feedData?.topStreaksFootball || []}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onPlayerClick={handlePlayerClick}
            onToggleSave={toggleSaveBet}
            savedIds={savedBets.map(b => b.id)}
         />
       </div>
    );
  };

  // Full Screen Views
  if (selectedPlayer) {
    return <PlayerDetail profile={selectedPlayer} onBack={handleBack} />;
  }

  return (
    <div className="bg-[#0f1012] text-white font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1012]/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3" onClick={() => {setActiveTab('home'); }}>
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <span className="text-black font-black text-lg">B</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">Berone<span className="text-yellow-500">Bets</span></h1>
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Intelligence</span>
          </div>
        </div>
        <button onClick={() => loadData(currentDate)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center active:rotate-180 transition-transform border border-zinc-700">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-400">
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
           </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#161616]/95 backdrop-blur border-t border-zinc-800 pb-safe z-40 h-16 flex items-center justify-around">
         <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-16 gap-1 ${activeTab === 'home' ? 'text-yellow-500' : 'text-zinc-500'}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
            <span className="text-[10px] font-bold">Início</span>
         </button>

         <button 
            onClick={() => setActiveTab('bets')}
            className={`flex flex-col items-center justify-center w-16 gap-1 ${activeTab === 'bets' ? 'text-yellow-500' : 'text-zinc-500'}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold">Salvas</span>
         </button>

         <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-16 gap-1 ${activeTab === 'profile' ? 'text-yellow-500' : 'text-zinc-500'}`}
         >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
               <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] font-bold">Perfil</span>
         </button>
      </nav>
    </div>
  );
};

export default App;
