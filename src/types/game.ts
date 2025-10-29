export interface Position {
    x: number;
    y: number;
  }
  
  export interface GameState {
    snake: Position[];
    food: Position;
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    gameOver: boolean;
    score: number;
    isPaused: boolean;
  }
  
  export const GRID_SIZE = 20;
  export const CELL_SIZE = 20;
  export const GAME_SPEED = 150;