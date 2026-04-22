export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface GameState {
  happinessPoints: number;
  highestLevelReached: number;
  gameOver: boolean;
  difficulty: Difficulty;
}

export interface EvolutionLevel {
  level: number;
  name: string;
  radius: number;
  color: string;
  icon: string;
  points: number;
}
