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
}

export interface EvolutionLevel {
  level: number;
  name: string;
  radius: number;
  color: string;
  icon: string;
  points: number;
}
