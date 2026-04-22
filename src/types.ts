export interface GameState {
  happinessPoints: number;
  highestLevelReached: number;
  gameOver: boolean;
}

export interface EvolutionLevel {
  level: number;
  name: string;
  radius: number;
  color: string;
  icon: string;
  points: number;
}
