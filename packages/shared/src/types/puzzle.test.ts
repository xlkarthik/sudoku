import { describe, it, expect } from 'vitest';
import { 
  PuzzleVariant, 
  Difficulty, 
  PuzzleSize, 
  SolvingTechnique,
  type Puzzle,
  type PuzzleMetadata,
  type Position,
  type Constraint
} from './puzzle.js';

describe('Puzzle Types', () => {
  it('should create a valid Position', () => {
    const position: Position = { row: 0, col: 0 };
    expect(position.row).toBe(0);
    expect(position.col).toBe(0);
  });

  it('should create a valid Constraint', () => {
    const constraint: Constraint = {
      type: 'cage',
      positions: [{ row: 0, col: 0 }, { row: 0, col: 1 }],
      value: 15,
      operation: 'sum'
    };
    
    expect(constraint.type).toBe('cage');
    expect(constraint.positions).toHaveLength(2);
    expect(constraint.value).toBe(15);
    expect(constraint.operation).toBe('sum');
  });

  it('should create valid PuzzleMetadata', () => {
    const metadata: PuzzleMetadata = {
      estimatedSolveTime: 300,
      techniques: [SolvingTechnique.NAKED_SINGLES, SolvingTechnique.HIDDEN_SINGLES],
      rating: 7.5,
      playCount: 1000,
      averageSolveTime: 280,
      tags: ['daily', 'featured']
    };

    expect(metadata.estimatedSolveTime).toBe(300);
    expect(metadata.techniques).toContain(SolvingTechnique.NAKED_SINGLES);
    expect(metadata.rating).toBe(7.5);
    expect(metadata.tags).toContain('daily');
  });

  it('should create a valid Puzzle', () => {
    const puzzle: Puzzle = {
      id: 'puzzle-123',
      variant: PuzzleVariant.CLASSIC,
      difficulty: Difficulty.MEDIUM,
      size: PuzzleSize.CLASSIC_9X9,
      initialState: Array(9).fill(null).map(() => Array(9).fill(0)),
      solution: Array(9).fill(null).map(() => Array(9).fill(1)),
      constraints: [],
      metadata: {
        estimatedSolveTime: 300,
        techniques: [SolvingTechnique.NAKED_SINGLES],
        rating: 7.0,
        playCount: 0,
        averageSolveTime: 0
      },
      createdAt: new Date(),
      difficultyScore: 7.0
    };

    expect(puzzle.id).toBe('puzzle-123');
    expect(puzzle.variant).toBe(PuzzleVariant.CLASSIC);
    expect(puzzle.difficulty).toBe(Difficulty.MEDIUM);
    expect(puzzle.size).toBe(PuzzleSize.CLASSIC_9X9);
    expect(puzzle.initialState).toHaveLength(9);
    expect(puzzle.solution).toHaveLength(9);
  });

  it('should validate enum values', () => {
    expect(Object.values(PuzzleVariant)).toContain('classic');
    expect(Object.values(Difficulty)).toContain('medium');
    expect(Object.values(PuzzleSize)).toContain(9);
    expect(Object.values(SolvingTechnique)).toContain('naked_singles');
  });
});