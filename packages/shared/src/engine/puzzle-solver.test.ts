/**
 * Unit tests for puzzle solver and validation engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleSolver } from './puzzle-solver.js';
import { 
  Puzzle, 
  PuzzleVariant, 
  Difficulty, 
  PuzzleSize,
  SolvingTechnique,
  PuzzleMetadata 
} from '../types/puzzle.js';

describe('PuzzleSolver', () => {
  let solver: PuzzleSolver;

  beforeEach(() => {
    solver = new PuzzleSolver();
  });

  describe('solvePuzzle', () => {
    it('should solve a simple puzzle using naked singles', () => {
      const puzzle = createTestPuzzle([
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

      const result = solver.solvePuzzle(puzzle);

      expect(result.solved).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.solution![8][8]).toBe(9);
      expect(result.techniques).toContain(SolvingTechnique.NAKED_SINGLES);
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.timeElapsed).toBeGreaterThan(0);
    });

    it('should solve a medium difficulty puzzle', () => {
      const puzzle = createTestPuzzle([
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

      const result = solver.solvePuzzle(puzzle);

      expect(result.solved).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.techniques.length).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('should handle unsolvable puzzles', () => {
      const puzzle = createTestPuzzle([
        [1, 1, 0, 0, 0, 0, 0, 0, 0], // Invalid: two 1s in same row
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]);

      const result = solver.solvePuzzle(puzzle);

      expect(result.solved).toBe(false);
      expect(result.solution).toBeUndefined();
    });

    it('should track solving steps correctly', () => {
      const puzzle = createTestPuzzle([
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0]
      ]);

      const result = solver.solvePuzzle(puzzle);

      expect(result.steps.length).toBe(1);
      expect(result.steps[0].technique).toBe(SolvingTechnique.NAKED_SINGLES);
      expect(result.steps[0].position).toEqual({ row: 8, col: 8 });
      expect(result.steps[0].value).toBe(9);
      expect(result.steps[0].description).toContain('Naked single');
    });

    it('should attempt to solve puzzles with minimal clues', () => {
      const puzzle = createTestPuzzle([
        [5, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]);

      const result = solver.solvePuzzle(puzzle);

      // This puzzle has too few clues to be uniquely solvable,
      // but we're testing that the solver doesn't hang
      expect(result.timeElapsed).toBeLessThan(15000); // Should complete within 15 seconds
    });

    it('should handle 6x6 mini puzzles', () => {
      const miniPuzzle = createMiniTestPuzzle([
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [3, 4, 5, 6, 1, 2],
        [6, 1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6, 1],
        [5, 6, 1, 2, 3, 0] // Only one empty cell
      ]);

      const result = solver.solvePuzzle(miniPuzzle);

      expect(result.solved).toBe(true);
      expect(result.solution).toBeDefined();
      if (result.solution) {
        expect(result.solution).toHaveLength(6);
        expect(result.solution[0]).toHaveLength(6);
        expect(result.solution[5][5]).toBe(4);
      }
    });

    it('should complete within reasonable time', () => {
      const puzzle = createTestPuzzle([
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

      const result = solver.solvePuzzle(puzzle);

      expect(result.timeElapsed).toBeLessThan(5000); // Should solve in less than 5 seconds
    });
  });

  describe('validatePuzzle', () => {
    it('should validate a correct puzzle state', () => {
      const validGrid = [
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

      const result = solver.validatePuzzle(validGrid);

      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.conflictingCells).toHaveLength(0);
    });

    it('should detect row conflicts', () => {
      const invalidGrid = [
        [1, 1, 0, 0, 0, 0, 0, 0, 0], // Two 1s in same row
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solver.validatePuzzle(invalidGrid);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('duplicate_in_row');
      expect(result.conflictingCells.length).toBeGreaterThan(0);
    });

    it('should detect column conflicts', () => {
      const invalidGrid = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0], // Two 1s in same column
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solver.validatePuzzle(invalidGrid);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'duplicate_in_column')).toBe(true);
    });

    it('should detect box conflicts', () => {
      const invalidGrid = [
        [1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0], // Two 1s in same box
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solver.validatePuzzle(invalidGrid);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'duplicate_in_box')).toBe(true);
    });

    it('should detect invalid values', () => {
      const invalidGrid = [
        [10, 0, 0, 0, 0, 0, 0, 0, 0], // Invalid value 10 in 9x9 grid
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solver.validatePuzzle(invalidGrid);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === 'invalid_value')).toBe(true);
    });

    it('should handle incomplete but valid puzzles', () => {
      const incompleteGrid = [
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

      const result = solver.validatePuzzle(incompleteGrid);

      expect(result.isValid).toBe(true);
      expect(result.isComplete).toBe(false);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('hasUniqueSolution', () => {
    it('should confirm unique solution for valid puzzles', () => {
      const validPuzzle = [
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

      const hasUnique = solver.hasUniqueSolution(validPuzzle);
      expect(hasUnique).toBe(true);
    });

    it('should detect multiple solutions', () => {
      const multipleSolutionPuzzle = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const hasUnique = solver.hasUniqueSolution(multipleSolutionPuzzle);
      expect(hasUnique).toBe(false);
    });

    it('should handle unsolvable puzzles', () => {
      const unsolvablePuzzle = [
        [1, 1, 0, 0, 0, 0, 0, 0, 0], // Invalid puzzle
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const hasUnique = solver.hasUniqueSolution(unsolvablePuzzle);
      expect(hasUnique).toBe(false);
    });
  });

  describe('getCandidates', () => {
    it('should return correct candidates for empty cell', () => {
      const grid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only 9 can go here
      ];

      const candidates = solver.getCandidates(grid, 8, 8);
      expect(candidates).toEqual([9]);
    });

    it('should return empty array for filled cell', () => {
      const grid = [
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

      const candidates = solver.getCandidates(grid, 0, 0); // Cell contains 5
      expect(candidates).toEqual([]);
    });

    it('should return multiple candidates for complex cell', () => {
      const grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const candidates = solver.getCandidates(grid, 0, 0);
      expect(candidates).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('performance and optimization', () => {
    it('should solve multiple puzzles efficiently', () => {
      const puzzles = [
        createTestPuzzle([
          [5, 3, 0, 0, 7, 0, 0, 0, 0],
          [6, 0, 0, 1, 9, 5, 0, 0, 0],
          [0, 9, 8, 0, 0, 0, 0, 6, 0],
          [8, 0, 0, 0, 6, 0, 0, 0, 3],
          [4, 0, 0, 8, 0, 3, 0, 0, 1],
          [7, 0, 0, 0, 2, 0, 0, 0, 6],
          [0, 6, 0, 0, 0, 0, 2, 8, 0],
          [0, 0, 0, 4, 1, 9, 0, 0, 5],
          [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ]),
        createTestPuzzle([
          [0, 0, 0, 6, 0, 0, 4, 0, 0],
          [7, 0, 0, 0, 0, 3, 6, 0, 0],
          [0, 0, 0, 0, 9, 1, 0, 8, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 5, 0, 1, 8, 0, 0, 0, 3],
          [0, 0, 0, 3, 0, 6, 0, 4, 5],
          [0, 4, 0, 2, 0, 0, 0, 6, 0],
          [9, 0, 3, 0, 0, 0, 0, 0, 0],
          [0, 2, 0, 0, 0, 0, 1, 0, 0]
        ])
      ];

      const startTime = Date.now();
      const results = puzzles.map(puzzle => solver.solvePuzzle(puzzle));
      const totalTime = Date.now() - startTime;

      expect(results.every(r => r.solved)).toBe(true);
      expect(totalTime).toBeLessThan(10000); // Should solve both in less than 10 seconds
    });

    it('should not exceed iteration limits', () => {
      // Create a very difficult puzzle that might require many iterations
      const difficultPuzzle = createTestPuzzle([
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [4, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 6, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]);

      const result = solver.solvePuzzle(difficultPuzzle);

      // Should complete within reasonable time even if not solved
      expect(result.timeElapsed).toBeLessThan(30000); // 30 seconds max
    });
  });
});

// Helper functions
function createTestPuzzle(initialState: number[][]): Puzzle {
  const metadata: PuzzleMetadata = {
    estimatedSolveTime: 600,
    techniques: [],
    rating: 5.0,
    playCount: 0,
    averageSolveTime: 0,
    tags: ['test']
  };

  return {
    id: `test-${Date.now()}`,
    variant: PuzzleVariant.CLASSIC,
    difficulty: Difficulty.MEDIUM,
    size: PuzzleSize.CLASSIC_9X9,
    initialState,
    solution: [], // Not needed for solver tests
    constraints: [],
    metadata,
    createdAt: new Date(),
    difficultyScore: 5.0
  };
}

function createMiniTestPuzzle(initialState: number[][]): Puzzle {
  const metadata: PuzzleMetadata = {
    estimatedSolveTime: 300,
    techniques: [],
    rating: 3.0,
    playCount: 0,
    averageSolveTime: 0,
    tags: ['test', 'mini']
  };

  return {
    id: `mini-test-${Date.now()}`,
    variant: PuzzleVariant.MINI,
    difficulty: Difficulty.MEDIUM,
    size: PuzzleSize.MINI_6X6,
    initialState,
    solution: [], // Not needed for solver tests
    constraints: [],
    metadata,
    createdAt: new Date(),
    difficultyScore: 3.0
  };
}