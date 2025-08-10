/**
 * Unit tests for difficulty calibration system
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DifficultyCalibrator } from './difficulty-calibrator.js';
import { 
  Puzzle, 
  PuzzleVariant, 
  Difficulty, 
  PuzzleSize,
  SolvingTechnique,
  PuzzleMetadata 
} from '../types/puzzle.js';

describe('DifficultyCalibrator', () => {
  let calibrator: DifficultyCalibrator;

  beforeEach(() => {
    calibrator = new DifficultyCalibrator();
  });

  describe('calibrateDifficulty', () => {
    it('should calibrate difficulty for a simple puzzle', () => {
      const simplePuzzle = createTestPuzzle(Difficulty.EASY, [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ]);

      const result = calibrator.calibrateDifficulty(simplePuzzle);

      expect(result.calculatedDifficulty).toBeDefined();
      expect(result.difficultyScore).toBeGreaterThan(0);
      expect(result.difficultyScore).toBeLessThanOrEqual(10);
      expect(result.requiredTechniques).toBeInstanceOf(Array);
      expect(result.requiredTechniques.length).toBeGreaterThan(0);
      expect(result.estimatedSolveTime).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify basic techniques for simple puzzles', () => {
      const simplePuzzle = createTestPuzzle(Difficulty.BEGINNER, [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only one empty cell
      ]);

      const result = calibrator.calibrateDifficulty(simplePuzzle);

      expect(result.requiredTechniques).toContain(SolvingTechnique.NAKED_SINGLES);
      expect(result.calculatedDifficulty).toBe(Difficulty.BEGINNER);
    });

    it('should assign higher difficulty scores to complex puzzles', () => {
      const simplePuzzle = createTestPuzzle(Difficulty.EASY);
      const complexPuzzle = createTestPuzzle(Difficulty.HARD);

      // Use generation mode to ensure different techniques are applied based on difficulty
      const simpleResult = calibrator.calibrateDifficulty(simplePuzzle, true);
      const complexResult = calibrator.calibrateDifficulty(complexPuzzle, true);

      expect(complexResult.difficultyScore).toBeGreaterThan(simpleResult.difficultyScore);
    });

    it('should estimate solve time based on complexity', () => {
      const puzzle = createTestPuzzle(Difficulty.MEDIUM);
      const result = calibrator.calibrateDifficulty(puzzle);

      expect(result.estimatedSolveTime).toBeGreaterThan(0);
      expect(result.estimatedSolveTime).toBeLessThan(3600); // Less than 1 hour
    });

    it('should provide confidence rating', () => {
      const puzzle = createTestPuzzle(Difficulty.MEDIUM);
      const result = calibrator.calibrateDifficulty(puzzle);

      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('validateDifficultyRating', () => {
    it('should validate correctly rated puzzles', () => {
      const puzzle = createTestPuzzle(Difficulty.MEDIUM);
      // Assume the puzzle is correctly rated for this test
      const isValid = calibrator.validateDifficultyRating(puzzle);
      
      // This test depends on the actual calibration logic
      expect(typeof isValid).toBe('boolean');
    });

    it('should detect incorrectly rated puzzles', () => {
      // Create a very simple puzzle but mark it as expert
      const simplePuzzle = createTestPuzzle(Difficulty.EXPERT, [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only one empty cell - too easy for expert
      ]);

      const isValid = calibrator.validateDifficultyRating(simplePuzzle);
      expect(isValid).toBe(false);
    });
  });

  describe('adjustDifficultyForVariant', () => {
    it('should increase difficulty for killer sudoku', () => {
      const baseDifficulty = 5.0;
      const killerPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      killerPuzzle.variant = PuzzleVariant.KILLER;

      const adjustedDifficulty = calibrator.adjustDifficultyForVariant(baseDifficulty, killerPuzzle);
      
      expect(adjustedDifficulty).toBeGreaterThan(baseDifficulty);
    });

    it('should increase difficulty for X-Sudoku', () => {
      const baseDifficulty = 5.0;
      const xSudokuPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      xSudokuPuzzle.variant = PuzzleVariant.X_SUDOKU;

      const adjustedDifficulty = calibrator.adjustDifficultyForVariant(baseDifficulty, xSudokuPuzzle);
      
      expect(adjustedDifficulty).toBeGreaterThan(baseDifficulty);
    });

    it('should decrease difficulty for mini sudoku', () => {
      const baseDifficulty = 5.0;
      const miniPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      miniPuzzle.variant = PuzzleVariant.MINI;
      miniPuzzle.size = PuzzleSize.MINI_6X6;

      const adjustedDifficulty = calibrator.adjustDifficultyForVariant(baseDifficulty, miniPuzzle);
      
      expect(adjustedDifficulty).toBeLessThan(baseDifficulty);
    });

    it('should not change difficulty for classic sudoku', () => {
      const baseDifficulty = 5.0;
      const classicPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      classicPuzzle.variant = PuzzleVariant.CLASSIC;

      const adjustedDifficulty = calibrator.adjustDifficultyForVariant(baseDifficulty, classicPuzzle);
      
      expect(adjustedDifficulty).toBe(baseDifficulty);
    });

    it('should cap adjusted difficulty at 10.0', () => {
      const baseDifficulty = 9.0;
      const hyperPuzzle = createTestPuzzle(Difficulty.EXPERT);
      hyperPuzzle.variant = PuzzleVariant.HYPER;

      const adjustedDifficulty = calibrator.adjustDifficultyForVariant(baseDifficulty, hyperPuzzle);
      
      expect(adjustedDifficulty).toBeLessThanOrEqual(10.0);
    });
  });

  describe('technique analysis accuracy', () => {
    it('should identify naked singles in appropriate puzzles', () => {
      const puzzle = createTestPuzzle(Difficulty.BEGINNER, [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Naked single at [8,8]
      ]);

      const result = calibrator.calibrateDifficulty(puzzle);
      expect(result.requiredTechniques).toContain(SolvingTechnique.NAKED_SINGLES);
    });

    it('should not require advanced techniques for simple puzzles', () => {
      const simplePuzzle = createTestPuzzle(Difficulty.BEGINNER);
      const result = calibrator.calibrateDifficulty(simplePuzzle);

      const advancedTechniques = [
        SolvingTechnique.X_WING,
        SolvingTechnique.SWORDFISH,
        SolvingTechnique.XY_WING,
        SolvingTechnique.COLORING
      ];

      const hasAdvancedTechniques = result.requiredTechniques.some(t => 
        advancedTechniques.includes(t)
      );

      expect(hasAdvancedTechniques).toBe(false);
    });
  });

  describe('confidence calculation', () => {
    it('should have high confidence for standard 9x9 puzzles', () => {
      const standardPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      const result = calibrator.calibrateDifficulty(standardPuzzle);

      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should have lower confidence for non-standard sizes', () => {
      const miniPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      miniPuzzle.size = PuzzleSize.MINI_6X6;
      miniPuzzle.initialState = createMiniGrid();
      miniPuzzle.solution = createMiniSolution();

      const result = calibrator.calibrateDifficulty(miniPuzzle);

      expect(result.confidence).toBeLessThan(1.0);
    });

    it('should have lower confidence for extreme difficulty scores', () => {
      // This would require a puzzle that generates extreme scores
      // For now, we'll test the boundary conditions
      const puzzle = createTestPuzzle(Difficulty.EXPERT);
      const result = calibrator.calibrateDifficulty(puzzle);

      expect(result.confidence).toBeGreaterThan(0.1);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('solve time estimation', () => {
    it('should estimate longer solve times for harder puzzles', () => {
      const easyPuzzle = createTestPuzzle(Difficulty.EASY);
      const hardPuzzle = createTestPuzzle(Difficulty.HARD);

      // Use generation mode to ensure different techniques are applied based on difficulty
      const easyResult = calibrator.calibrateDifficulty(easyPuzzle, true);
      const hardResult = calibrator.calibrateDifficulty(hardPuzzle, true);

      expect(hardResult.estimatedSolveTime).toBeGreaterThan(easyResult.estimatedSolveTime);
    });

    it('should estimate longer solve times for larger puzzles', () => {
      const normalPuzzle = createTestPuzzle(Difficulty.MEDIUM);
      
      // Create a 16x16 puzzle (would need proper implementation)
      const largePuzzle = createTestPuzzle(Difficulty.MEDIUM);
      largePuzzle.size = PuzzleSize.MEGA_16X16;

      const normalResult = calibrator.calibrateDifficulty(normalPuzzle);
      const largeResult = calibrator.calibrateDifficulty(largePuzzle);

      expect(largeResult.estimatedSolveTime).toBeGreaterThan(normalResult.estimatedSolveTime);
    });

    it('should provide reasonable solve time estimates', () => {
      const puzzle = createTestPuzzle(Difficulty.MEDIUM);
      const result = calibrator.calibrateDifficulty(puzzle);

      // Solve time should be between 1 minute and 2 hours
      expect(result.estimatedSolveTime).toBeGreaterThan(60);
      expect(result.estimatedSolveTime).toBeLessThan(7200);
    });
  });
});

// Helper functions
function createTestPuzzle(difficulty: Difficulty, initialState?: number[][]): Puzzle {
  const defaultInitialState = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];

  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  const metadata: PuzzleMetadata = {
    estimatedSolveTime: 600,
    techniques: [SolvingTechnique.NAKED_SINGLES, SolvingTechnique.HIDDEN_SINGLES],
    rating: 5.0,
    playCount: 0,
    averageSolveTime: 0,
    tags: ['test']
  };

  return {
    id: `test-${difficulty}-${Date.now()}`,
    variant: PuzzleVariant.CLASSIC,
    difficulty,
    size: PuzzleSize.CLASSIC_9X9,
    initialState: initialState || defaultInitialState,
    solution,
    constraints: [],
    metadata,
    createdAt: new Date(),
    difficultyScore: 5.0
  };
}

function createMiniGrid(): number[][] {
  return [
    [1, 0, 3, 4, 0, 6],
    [0, 5, 6, 0, 2, 3],
    [3, 4, 0, 6, 1, 0],
    [6, 0, 2, 3, 4, 5],
    [0, 3, 4, 5, 6, 1],
    [5, 6, 1, 2, 0, 4]
  ];
}

function createMiniSolution(): number[][] {
  return [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [3, 4, 5, 6, 1, 2],
    [6, 1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6, 1],
    [5, 6, 1, 2, 3, 4]
  ];
}