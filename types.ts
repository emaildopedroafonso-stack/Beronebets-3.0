
export enum Sport {
  NBA = 'NBA',
  FOOTBALL = 'Futebol'
}

export type AnalysisMode = 'AMBOS' | 'NBA' | 'FUTEBOL';

export interface Streak {
  id: string;
  title: string; // e.g. "5 jogos seguidos com +25 Pontos"
  metric: string; // e.g. "Points"
  value: string; // e.g. "25.7"
  length: number; // e.g. 5
  startDate: string;
  history: number[]; // e.g. [28, 30, 25, 26, 32]
  isActive: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  team: string;
  position: string;
  matchup?: string; // e.g. "Lakers @ Magic"
  date?: string; // ISO Date string
  imageUrl?: string; // URL for player image
  seasonStats: {
    label: string;
    value: string;
    trend: string; // e.g. "+1.5%"
  }[];
  streaks: Streak[];
  news: NewsItem[];
}

export interface NewsItem {
  source: string;
  title: string;
  imageUrl?: string;
  url: string;
}

export interface HomeFeedData {
  topStreaksNBA: PlayerProfile[];
  topStreaksFootball: PlayerProfile[];
  latestNews: NewsItem[];
}

export interface BettingOpportunity {
  sport: Sport;
  competition: string;
  match: string;
  type: 'PLAYER' | 'TEAM';
  player: string;
  metric: string;
  isGold: boolean;
  consistency: string;
  last10GamesRaw?: string;
  h2hInfo?: string;
  trend?: string;
}
