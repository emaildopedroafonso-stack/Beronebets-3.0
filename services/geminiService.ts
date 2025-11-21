import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, AnalysisMode } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é um ANALISTA DE APOSTAS ESPORTIVAS profissional focado em "BETBERONE GOLD".
Uma "BetBerone Gold" é uma oportunidade onde o jogador/time bateu a linha estatística em TODOS ou QUASE TODOS os últimos jogos (Ex: 5/5, 9/10).

ESTRATÉGIA:
1. Busque por jogos do dia solicitado.
2. Para cada jogo relevante, busque por "Prop Streaks", "Hit Rates" e "Cheat Sheets".
3. Identifique padrões perfeitos (100% de acerto recente).

REGRAS DE SAÍDA:
1. RETORNO ESTRITAMENTE JSON.
2. Se a consistência for "5/5", "10/10" ou ">90%", marque "isGold": true.
3. Priorize qualidade sobre quantidade. Mostre apenas as melhores.
`;

export const analyzeMarket = async (mode: AnalysisMode, targetDate?: string): Promise<AnalysisResult> => {
  const today = new Date();
  const dateObj = targetDate ? new Date(targetDate) : today;
  
  const dateString = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const isoDate = dateObj.toISOString().split('T')[0];

  let searchQueries = "";
  let specificInstruction = "";

  // Construção dinâmica das queries baseada na data
  if (mode === 'NBA') {
    searchQueries = `
    - "NBA betting cheat sheet ${isoDate} perfect streaks"
    - "NBA player props hit in last 5 games today ${isoDate}"
    - "best NBA bets today ${isoDate} 100% hit rate"
    - "NBA schedule ${isoDate} and injury news"
    `;
    specificInstruction = `
    PARA A NBA (${dateString}):
    1. Encontre jogadores que bateram a linha (Over/Under) em 5 dos últimos 5 jogos. ISSO É UMA "BETBERONE GOLD".
    2. Extraia os números dos jogos se possível (Ex: "22, 24, 28, 21, 25").
    3. Analise todos os jogos da rodada, mas retorne apenas os jogadores com 'Streak' ativa.
    `;
  } else if (mode === 'FUTEBOL') {
    searchQueries = `
    - "Brasileirão Série A e B palpites estatísticas ${isoDate}"
    - "Jogadores com mais chutes a gol últimos 5 jogos Brasileirão ${isoDate}"
    - "Times com mais escanteios últimos 5 jogos Série A Série B ${isoDate}"
    - "Football player props streaks Brazil Serie A ${isoDate}"
    `;
    specificInstruction = `
    PARA O FUTEBOL (${dateString}):
    1. Foco: Brasileirão Série A e Série B.
    2. Busque "BetBerone Golds": Jogadores com chute ao gol em 5/5 jogos, ou Times com Over Escanteios em 5/5 jogos.
    3. Inclua estatísticas de cartões se o árbitro for rigoroso.
    `;
  } else {
    // Modo AMBOS
    searchQueries = `
    - "Best NBA and Football prop bets today ${isoDate} streaks"
    - "Apostas de valor estatísticas NBA Futebol Brasileirão ${isoDate}"
    `;
    specificInstruction = `
    Identifique as "GOLD BETS" (Consistência 100% ou próxima) para NBA e Futebol na data de ${dateString}.
    `;
  }

  const prompt = `
    DATA ALVO: ${dateString} (${isoDate}).
    
    PASSO 1: Execute as buscas no Google para encontrar os "Streaks" (Sequências) e Agenda de Jogos.
    ${searchQueries}

    PASSO 2: Com base nos resultados, monte um JSON.

    ${specificInstruction}

    ESTRUTURA JSON OBRIGATÓRIA:
    {
      "opportunities": [
        {
          "sport": "NBA" | "Futebol",
          "competition": "Nome da Liga",
          "match": "Time Casa vs Time Fora",
          "player": "Nome do Jogador (ou Time)",
          "type": "PLAYER" | "TEAM",
          "metric": "Aposta (Ex: Over 20.5 Pts)",
          "consistency": "X/Y (Ex: 5/5)",
          "last10GamesRaw": "Lista numérica (Ex: 22, 18, 25...) OU '?' se não houver dados brutos",
          "h2hInfo": "Histórico vs Oponente",
          "trend": "Motivo/Notícia",
          "probability": "Alta" | "Muito Alta",
          "isGold": true/false (TRUE se consistência for 5/5, 10/10 ou muito alta)
        }
      ]
    }

    IMPORTANTE: Marque "isGold": true SE E SOMENTE SE o jogador tiver batido a meta na maioria esmagadora dos últimos jogos (Ex: 5/5, 4/5, 9/10).
  `;

  const parseResponse = (text: string) => {
    let jsonText = text.replace(/```json\n?/g, '').replace(/```/g, '');
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) throw new Error("Invalid JSON response structure");
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonText);
  };

  try {
    // Tentativa 1: Com Ferramenta de Busca (Requer permissão)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.1, 
      },
    });

    const parsedData = parseResponse(response.text || "");
    
    const sourceUrls: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sourceUrls.push(chunk.web.uri);
        }
      });
    }

    return {
      date: dateString,
      opportunities: parsedData.opportunities || [],
      sourceUrls: [...new Set(sourceUrls)].slice(0, 6),
    };

  } catch (error: any) {
    // Fallback para Erro 403 (Permission Denied) - Executa sem Search Tool
    if (error.status === 403 || error.code === 403 || (error.message && error.message.includes('permission'))) {
      console.warn("Permissão de busca negada (403). Executando em modo offline/estimativa.");
      
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt + "\n\nAVISO CRÍTICO: A ferramenta de busca está indisponível. Gere as melhores estimativas e projeções baseadas no seu conhecimento estatístico histórico dos times e jogadores. Indique no campo 'trend' que é uma Projeção.",
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            // Sem tools
            temperature: 0.3,
          },
        });

        const parsedData = parseResponse(fallbackResponse.text || "");
        
        // Marca as trends como projeção se não vierem marcadas
        const ops = (parsedData.opportunities || []).map((op: any) => ({
            ...op,
            trend: op.trend ? op.trend + " (Projeção Offline)" : "Dados Projetados (Busca Indisponível)"
        }));

        return {
          date: dateString,
          opportunities: ops,
          sourceUrls: [], // Sem fontes externas
        };

      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError);
        throw fallbackError;
      }
    }

    console.error("Error fetching betting analysis:", error);
    throw error;
  }
};