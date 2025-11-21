import React, { useState, useEffect } from 'react';
import { analyzeMarket } from './services/geminiService';
import BettingTable from './components/BettingTable';
import { AnalysisResult, AnalysisMode } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean>(false);
  const [mode, setMode] = useState<AnalysisMode>('AMBOS');
  
  // Date Selection State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOptions, setDateOptions] = useState<Date[]>([]);

  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKeyAvailable(true);
    }
    // Generate next 5 days
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    setDateOptions(dates);
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const data = await analyzeMarket(mode, dateStr);
      setResult(data);
    } catch (err) {
      setError("Falha ao analisar o mercado. Verifique sua conexão ou tente outra data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'HOJE';
    if (isTomorrow) return 'AMANHÃ';
    
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }).toUpperCase().replace('.', '');
  };

  if (!apiKeyAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erro de Configuração</h1>
          <p className="text-zinc-400">A chave de API não foi encontrada. Certifique-se de que <code>process.env.API_KEY</code> está configurada corretamente no ambiente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-200 font-sans selection:bg-red-600/30 pb-24 md:pb-0">
      {/* Header Style Superbet/Bet365 Hybrid */}
      <header className="bg-[#1e1e1e] sticky top-0 z-50 shadow-md border-b border-zinc-800">
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Icon mimicking Superbet's red vibrancy */}
            <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center transform -skew-x-6 shadow-lg shadow-red-600/20 border border-red-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6 text-white transform skew-x-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black tracking-tighter text-white leading-none italic">
                BERONE<span className="text-red-600">BETS</span>
              </h1>
              <span className="text-[8px] md:text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Gold Edition</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] md:text-xs font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500"></span>
                v2.0
             </span>
          </div>
        </div>
        
        {/* Date Selector (Scrollable) */}
        <div className="w-full overflow-x-auto scrollbar-hide bg-[#181818] border-b border-zinc-800">
          <div className="max-w-7xl mx-auto px-2 flex items-center space-x-1 py-2 min-w-max">
            {dateOptions.map((date, idx) => {
               const isSelected = date.toDateString() === selectedDate.toDateString();
               return (
                 <button
                   key={idx}
                   onClick={() => setSelectedDate(date)}
                   className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-md transition-all min-w-[70px] ${
                     isSelected 
                       ? 'bg-zinc-700 text-white shadow-md border-b-2 border-red-500' 
                       : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                   }`}
                 >
                   <span className="text-[10px] uppercase font-black tracking-wider">{formatDateLabel(date)}</span>
                   <span className="text-xs font-medium">{date.getDate()}/{date.getMonth() + 1}</span>
                 </button>
               );
            })}
          </div>
        </div>

        {/* Mobile Sport Selector (Sticky Sub-header) */}
        <div className="md:hidden px-2 py-2 bg-[#1e1e1e] border-b border-zinc-800">
           <div className="flex p-1 bg-[#121212] rounded-lg border border-zinc-800">
              {(['AMBOS', 'FUTEBOL', 'NBA'] as AnalysisMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  disabled={loading}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${
                    mode === m
                      ? 'bg-zinc-700 text-white shadow-sm border border-zinc-600'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {m === 'AMBOS' ? 'Todos' : m}
                </button>
              ))}
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 md:py-8">
        
        {/* Desktop Control Panel */}
        <div className="hidden md:block mb-8 bg-[#1e1e1e] rounded-2xl p-6 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                Análise de Mercado 
                <span className="text-yellow-500 text-lg">🏆</span>
              </h2>
              <p className="text-zinc-400 text-sm max-w-lg">
                Encontre as "BetBerone Golds": Oportunidades onde a consistência recente é de 100% (5/5 jogos).
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-auto">
               {!loading && (
                <div className="flex p-1 bg-[#121212] rounded-lg border border-zinc-800">
                  {(['AMBOS', 'FUTEBOL', 'NBA'] as AnalysisMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 px-6 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-all ${
                        mode === m
                          ? 'bg-white text-black shadow-lg transform scale-[1.02]'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {m === 'AMBOS' ? 'Todos' : m}
                    </button>
                  ))}
                </div>
              )}
              {!result && !loading && (
                <button onClick={handleAnalyze} className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase rounded-lg transition-all shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-[4px]">
                  Gerar Apostas
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Initial State Mobile */}
        {!result && !loading && (
             <div className="md:hidden text-center py-12 px-4 flex flex-col items-center justify-center min-h-[50vh]">
               <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">📊</span>
               </div>
               <h2 className="text-xl font-bold text-white mb-2">Pronto para Analisar?</h2>
               <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mx-auto">
                 Selecione a data acima e clique no botão abaixo para buscar as melhores oportunidades "Gold".
               </p>
             </div>
        )}

        {/* Loading */}
        {loading && (
            <div className="mt-12 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-zinc-800 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                 <h3 className="text-white font-bold text-lg animate-pulse">Analisando Dados...</h3>
                 <p className="text-zinc-500 text-sm mt-1">Buscando sequências perfeitas em {selectedDate.toLocaleDateString()}</p>
              </div>
            </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 p-4 bg-red-900/10 border border-red-900/50 rounded-lg flex items-center justify-center gap-3 text-red-400 text-center">
             <span>⚠️ {error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-fade-in-up space-y-4">
             <div className="hidden md:flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-2 h-6 bg-red-600 rounded-sm"></span>
                  Oportunidades: {result.date}
                </h3>
                <button onClick={handleAnalyze} className="text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 px-3 py-2 rounded hover:bg-zinc-700">
                  Atualizar
                </button>
             </div>
             
             <BettingTable data={result.opportunities} />

             {result.sourceUrls.length > 0 && (
               <div className="mt-8 flex flex-wrap gap-2 justify-center opacity-60">
                 {result.sourceUrls.map((url, idx) => (
                   <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-900 rounded hover:text-white">{new URL(url).hostname}</a>
                 ))}
               </div>
             )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-zinc-800 p-3 z-50 safe-area-bottom">
         <button 
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 disabled:bg-zinc-800 text-white font-bold uppercase tracking-wider rounded-lg shadow-[0_4px_0_rgb(120,20,20)] active:shadow-none active:translate-y-[4px] active:border-t-4 active:border-transparent transition-all"
         >
            {loading ? 'Processando...' : (result ? 'Atualizar' : 'BUSCAR GOLD BETS')}
         </button>
      </div>
    </div>
  );
};

export default App;