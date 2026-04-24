export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface GameState {
  happinessPoints: number;
  highestLevelReached: number;
  highScore: number;
  comboCount: number;
  gameOver: boolean;
  difficulty: Difficulty;
  powerUps: {
    hammer: number;
    magnet: number;
  };
  achievements: string[];
  customImages: Record<number, string>;
  // New Ecosystem Features
  holdLevel: number | null; // Stores one ball to swap
  currency: number; // Points that can be spent
  currentTitle: string;
  isZenMode: boolean; // No game over mode
  weather: 'clear' | 'windy' | 'storm' | 'snow';
  // Advanced Ecosystem Features
  harvestMode: boolean; // Double coins for a period
  sagaProgress: number; // Percent of total milestones completed
}

export interface EvolutionLevel {
  level: number;
  name: string;
  radius: number;
  color: string;
  emoji: string;
  points: number;
  lore: string;
  customImage?: string;
}
