export enum Sport {
  NBA = 'NBA',
  FOOTBALL = 'Futebol'
}

export type AnalysisMode = 'AMBOS' | 'NBA' | 'FUTEBOL';

export interface BettingOpportunity {
  competition: string;
  match: string;
  player: string; // Can be Player Name or Team Name
  metric: string; // e.g., "Over 20.5 Points", "Escanteios HT > 4.5"
  consistency: string; // e.g., "8/10"
  last10GamesRaw: string; // Brief description e.g., "22, 18, 25, ..."
  probability: string; // e.g., "Alta", "Muito Alta"
  sport: Sport;
  type?: 'PLAYER' | 'TEAM'; // To distinguish between player props and team stats
  h2hInfo?: string; // New field for Head-to-Head context (e.g., "Avg 25pts vs Team X")
  trend?: string; // For news/context
  isGold?: boolean; // True if consistency is perfect (e.g. 5/5 or >90%)
}

export interface AnalysisResult {
  date: string;
  opportunities: BettingOpportunity[];
  sourceUrls: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}