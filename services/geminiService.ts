
import { GoogleGenAI } from "@google/genai";
import { AnalysisMode, HomeFeedData, PlayerProfile, Sport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o motor de inteligência do "BeroneBets 3.0".
Sua missão é simular o comportamento de apps como "Packball" ou "PremierFC", que analisam estatísticas massivas para encontrar "Sure Bets" (Apostas com altíssima probabilidade baseada em histórico recente).

FONTES DE DADOS PARA SIMULAR:
- NBA: StatMuse, Basketball Reference (Foco em "Game Log" e "Prop Hit Rate").
- Futebol: FBref, SofaScore, Flashscore (Foco em "Chutes no alvo", "Faltas", "Desarmes").

REGRAS CRÍTICAS:
1. **Consistência é Rei:** Só destaque jogadores que bateram a linha em pelo menos 80% dos últimos 5 a 10 jogos (ex: 4/5 ou 8/10).
2. **Visualização de Green:** O campo 'history' deve ser um array de números reais dos últimos jogos.
3. **Agrupamento:** Sempre forneça o campo "matchup" (Ex: "Lakers @ Magic") para agrupar os jogadores por jogo.
`;

export const fetchHomeFeed = async (mode: AnalysisMode, dateStr: string): Promise<HomeFeedData> => {
  const prompt = `
    Data da Análise: ${dateStr}
    
    Tarefa: Analise a agenda de jogos desta data (${dateStr}) para NBA e Brasileirão (ou principais ligas de futebol se não houver BR).
    
    1. Liste os principais jogos do dia.
    2. Para CADA jogo, identifique jogadores com "Gold Streaks" (Sequências perfeitas ou quase perfeitas).
    
    Retorne JSON estrito:
    {
      "topStreaksNBA": [
        {
          "id": "nba_1",
          "name": "Player Name",
          "team": "Team",
          "matchup": "Team A @ Team B",
          "position": "POS",
          "seasonStats": [{"label": "PTS", "value": "25.0", "trend": "+1.2"}],
          "streaks": [
             {
               "id": "s1",
               "title": "Over 20.5 Points",
               "metric": "Points",
               "value": "20.5", 
               "length": 5,
               "startDate": "Last 5 Games",
               "history": [22, 25, 28, 24, 30], 
               "isActive": true
             }
          ],
          "news": []
        }
      ],
      "topStreaksFootball": [ ... mesmo formato, inclua "matchup": "Time A vs Time B" ... ],
      "latestNews": []
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as HomeFeedData;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("AI Service Error:", error);
    return getMockData(dateStr); 
  }
};

const getMockData = (dateStr: string): HomeFeedData => ({
  topStreaksNBA: [
    {
      id: "mock_nba_1",
      name: "Nikola Jokic",
      team: "Denver Nuggets",
      matchup: "Nuggets @ Lakers",
      position: "C",
      seasonStats: [
        { label: "Média PTS", value: "26.1", trend: "+0.5%" },
        { label: "Média REB", value: "12.3", trend: "+1.2%" }
      ],
      streaks: [
        { 
          id: "s1", 
          title: "Bateu em 5/5 jogos recentes", 
          metric: "Rebounds", 
          value: "10.5", 
          length: 5, 
          startDate: "Últimos 5", 
          history: [12, 14, 11, 13, 15], 
          isActive: true 
        }
      ],
      news: []
    },
    {
        id: "mock_nba_2",
        name: "Jamal Murray",
        team: "Denver Nuggets",
        matchup: "Nuggets @ Lakers",
        position: "PG",
        seasonStats: [
          { label: "Média AST", value: "6.5", trend: "+0.1%" }
        ],
        streaks: [
          { 
            id: "s2", 
            title: "4+ Assistências em 9/10", 
            metric: "Assists", 
            value: "3.5", 
            length: 9, 
            startDate: "Últimos 10", 
            history: [5, 4, 6, 7, 3, 5, 8, 4, 5, 6], 
            isActive: true 
          }
        ],
        news: []
      }
  ],
  topStreaksFootball: [
    {
      id: "mock_fut_1",
      name: "Hulk",
      team: "Atlético-MG",
      matchup: "Atlético-MG vs Flamengo",
      position: "ATA",
      seasonStats: [
        { label: "Chutes/Jogo", value: "3.2", trend: "Alta" }
      ],
      streaks: [
        { 
          id: "s3", 
          title: "Chute ao gol em 4 jogos seguidos", 
          metric: "SOT", 
          value: "0.5", 
          length: 4, 
          startDate: "Sequência Atual", 
          history: [2, 1, 3, 1, 0], 
          isActive: true 
        }
      ],
      news: []
    }
  ],
  latestNews: [
    { source: "Berone AI", title: `Análise gerada para os jogos de ${dateStr}`, url: "#" }
  ]
});
