/**
 * Core puzzle-related types and interfaces
 */

export enum PuzzleVariant {
  CLASSIC = 'classic',
  KILLER = 'killer',
  X_SUDOKU = 'x-sudoku',
  HYPER = 'hyper',
  MINI = 'mini',
  MEGA = 'mega'
}

export enum Difficulty {
  BEGINNER = 'beginner',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export enum PuzzleSize {
  MINI_6X6 = 6,
  CLASSIC_9X9 = 9,
  MEGA_16X16 = 16
}

export enum SolvingTechnique {
  NAKED_SINGLES = 'naked_singles',
  HIDDEN_SINGLES = 'hidden_singles',
  NAKED_PAIRS = 'naked_pairs',
  HIDDEN_PAIRS = 'hidden_pairs',
  POINTING_PAIRS = 'pointing_pairs',
  BOX_LINE_REDUCTION = 'box_line_reduction',
  X_WING = 'x_wing',
  SWORDFISH = 'swordfish',
  XY_WING = 'xy_wing',
  COLORING = 'coloring',
  FORCING_CHAINS = 'forcing_chains'
}

export interface Position {
  row: number;
  col: number;
}

export interface Constraint {
  type: 'cage' | 'diagonal' | 'extra_region';
  positions: Position[];
  value?: number; // For killer sudoku cages
  operation?: 'sum' | 'product' | 'difference'; // For killer sudoku
}

export interface PuzzleMetadata {
  estimatedSolveTime: number; // in seconds
  techniques: SolvingTechnique[];
  rating: number; // 1-10 scale
  playCount: number;
  averageSolveTime: number; // in seconds
  createdBy?: string; // user ID if user-generated
  tags?: string[];
}

export interface Puzzle {
  id: string;
  variant: PuzzleVariant;
  difficulty: Difficulty;
  size: PuzzleSize;
  initialState: number[][]; // 0 represents empty cell
  solution: number[][];
  constraints: Constraint[];
  metadata: PuzzleMetadata;
  createdAt: Date;
  difficultyScore: number; // Calculated difficulty rating
}

export interface PuzzleGenerationOptions {
  variant: PuzzleVariant;
  difficulty: Difficulty;
  size: PuzzleSize;
  seed?: string; // For reproducible generation
  constraints?: Constraint[];
}