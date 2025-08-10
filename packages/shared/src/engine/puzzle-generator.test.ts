/**
 * Unit tests for puzzle generation algorithms
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PuzzleGenerator } from './puzzle-generator.js';
import { 
  PuzzleGenerationOptions, 
  PuzzleVariant, 
  Difficulty, 
  PuzzleSize,
  SolvingTechnique 
} from '../types/puzzle.js';

describe('PuzzleGenerator', () => {
  let generator: PuzzleGenerator;

  beforeEach(() => {
    generator = new PuzzleGenerator();
  });

  describe('generatePuzzle', () => {
    it('should generate a valid classic 9x9 puzzle', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);

      expect(puzzle).toBeDefined();
      expect(puzzle.variant).toBe(PuzzleVariant.CLASSIC);
      expect(puzzle.difficulty).toBe(Difficulty.MEDIUM);
      expect(puzzle.size).toBe(PuzzleSize.CLASSIC_9X9);
      expect(puzzle.initialState).toHaveLength(9);
      expect(puzzle.solution).toHaveLength(9);
      expect(puzzle.initialState[0]).toHaveLength(9);
      expect(puzzle.solution[0]).toHaveLength(9);
    });

    it('should generate puzzles with different difficulties', async () => {
      const difficulties = [Difficulty.BEGINNER, Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD, Difficulty.EXPERT];
      
      for (const difficulty of difficulties) {
        const options: PuzzleGenerationOptions = {
          variant: PuzzleVariant.CLASSIC,
          difficulty,
          size: PuzzleSize.CLASSIC_9X9
        };

        const puzzle = await generator.generatePuzzle(options);
        expect(puzzle.difficulty).toBe(difficulty);
        expect(puzzle.difficultyScore).toBeGreaterThan(0);
      }
    });

    it('should generate puzzles with different sizes', async () => {
      const sizes = [PuzzleSize.MINI_6X6, PuzzleSize.CLASSIC_9X9];
      
      for (const size of sizes) {
        const options: PuzzleGenerationOptions = {
          variant: PuzzleVariant.CLASSIC,
          difficulty: Difficulty.MEDIUM,
          size
        };

        const puzzle = await generator.generatePuzzle(options);
        expect(puzzle.size).toBe(size);
        expect(puzzle.initialState).toHaveLength(size);
        expect(puzzle.solution).toHaveLength(size);
        expect(puzzle.initialState[0]).toHaveLength(size);
        expect(puzzle.solution[0]).toHaveLength(size);
      }
    });

    it('should throw error for invalid puzzle size', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: 8 as PuzzleSize // Invalid size (not a perfect square root)
      };

      await expect(generator.generatePuzzle(options)).rejects.toThrow('Invalid puzzle size');
    });

    it('should generate puzzle with proper metadata', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);

      expect(puzzle.metadata).toBeDefined();
      expect(puzzle.metadata.estimatedSolveTime).toBeGreaterThan(0);
      expect(puzzle.metadata.techniques).toBeInstanceOf(Array);
      expect(puzzle.metadata.rating).toBeGreaterThan(0);
      expect(puzzle.metadata.playCount).toBe(0);
      expect(puzzle.metadata.averageSolveTime).toBe(0);
      expect(puzzle.createdAt).toBeInstanceOf(Date);
    });

    it('should generate unique puzzle IDs', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle1 = await generator.generatePuzzle(options);
      const puzzle2 = await generator.generatePuzzle(options);

      expect(puzzle1.id).not.toBe(puzzle2.id);
    });
  });

  describe('validateUniqueSolution', () => {
    it('should validate that a complete solution has unique solution', () => {
      const completeSolution = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9, 1, 2, 3],
        [7, 8, 9, 1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5, 6, 7, 8, 9, 1],
        [5, 6, 7, 8, 9, 1, 2, 3, 4],
        [8, 9, 1, 2, 3, 4, 5, 6, 7],
        [3, 4, 5, 6, 7, 8, 9, 1, 2],
        [6, 7, 8, 9, 1, 2, 3, 4, 5],
        [9, 1, 2, 3, 4, 5, 6, 7, 8]
      ];

      const result = generator.validateUniqueSolution(completeSolution);
      expect(result).toBe(true);
    });

    it('should validate that a valid puzzle has unique solution', () => {
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

      const result = generator.validateUniqueSolution(validPuzzle);
      expect(result).toBe(true);
    });

    it('should detect puzzles with multiple solutions', () => {
      // A puzzle with too few clues (multiple solutions)
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

      const result = generator.validateUniqueSolution(multipleSolutionPuzzle);
      expect(result).toBe(false);
    });

    it('should handle invalid puzzles gracefully', () => {
      // A puzzle with conflicting clues (no solution)
      const invalidPuzzle = [
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

      const result = generator.validateUniqueSolution(invalidPuzzle);
      expect(result).toBe(false);
    });
  });

  describe('calculateDifficulty', () => {
    it('should calculate difficulty based on required techniques', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);
      const calculatedDifficulty = generator.calculateDifficulty(puzzle);

      expect(calculatedDifficulty).toBeGreaterThan(0);
      expect(calculatedDifficulty).toBeLessThanOrEqual(10);
    });

    it('should return higher difficulty for puzzles requiring advanced techniques', async () => {
      const easyOptions: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.EASY,
        size: PuzzleSize.CLASSIC_9X9
      };

      const hardOptions: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.HARD,
        size: PuzzleSize.CLASSIC_9X9
      };

      const easyPuzzle = await generator.generatePuzzle(easyOptions);
      const hardPuzzle = await generator.generatePuzzle(hardOptions);

      const easyDifficulty = generator.calculateDifficulty(easyPuzzle);
      const hardDifficulty = generator.calculateDifficulty(hardPuzzle);

      expect(hardDifficulty).toBeGreaterThan(easyDifficulty);
    });
  });

  describe('puzzle validation', () => {
    it('should generate puzzles with valid initial states', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);

      // Check that initial state doesn't violate Sudoku rules
      expect(isValidSudokuState(puzzle.initialState)).toBe(true);
    });

    it('should generate puzzles with valid complete solutions', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);

      // Check that solution is a valid complete Sudoku
      expect(isValidCompleteSudoku(puzzle.solution)).toBe(true);
    });

    it('should generate puzzles where initial state is subset of solution', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);

      // Check that every non-zero cell in initial state matches solution
      for (let row = 0; row < puzzle.size; row++) {
        for (let col = 0; col < puzzle.size; col++) {
          if (puzzle.initialState[row][col] !== 0) {
            expect(puzzle.initialState[row][col]).toBe(puzzle.solution[row][col]);
          }
        }
      }
    });

    it('should generate puzzles with appropriate number of clues for difficulty', async () => {
      const beginnerOptions: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.BEGINNER,
        size: PuzzleSize.CLASSIC_9X9
      };

      const expertOptions: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.EXPERT,
        size: PuzzleSize.CLASSIC_9X9
      };

      const beginnerPuzzle = await generator.generatePuzzle(beginnerOptions);
      const expertPuzzle = await generator.generatePuzzle(expertOptions);

      const beginnerClues = countClues(beginnerPuzzle.initialState);
      const expertClues = countClues(expertPuzzle.initialState);

      // Beginner puzzles should have more clues than expert puzzles
      expect(beginnerClues).toBeGreaterThan(expertClues);
    });
  });

  describe('technique analysis', () => {
    it('should identify required solving techniques', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(options);

      expect(puzzle.metadata.techniques).toBeInstanceOf(Array);
      expect(puzzle.metadata.techniques.length).toBeGreaterThan(0);
      
      // Should at least require basic techniques
      expect(puzzle.metadata.techniques).toContain(SolvingTechnique.NAKED_SINGLES);
    });

    it('should correlate techniques with difficulty rating', async () => {
      const easyOptions: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.EASY,
        size: PuzzleSize.CLASSIC_9X9
      };

      const puzzle = await generator.generatePuzzle(easyOptions);
      
      // Easy puzzles should primarily use basic techniques
      const advancedTechniques = [
        SolvingTechnique.X_WING,
        SolvingTechnique.SWORDFISH,
        SolvingTechnique.XY_WING,
        SolvingTechnique.COLORING,
        SolvingTechnique.FORCING_CHAINS
      ];

      const hasAdvancedTechniques = puzzle.metadata.techniques.some(t => 
        advancedTechniques.includes(t)
      );

      // Easy puzzles should not require many advanced techniques
      expect(hasAdvancedTechniques).toBe(false);
    });
  });

  describe('performance', () => {
    it('should generate puzzles within reasonable time', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const startTime = Date.now();
      await generator.generatePuzzle(options);
      const endTime = Date.now();

      const generationTime = endTime - startTime;
      
      // Should generate puzzle in less than 5 seconds
      expect(generationTime).toBeLessThan(5000);
    });

    it('should handle multiple concurrent generations', async () => {
      const options: PuzzleGenerationOptions = {
        variant: PuzzleVariant.CLASSIC,
        difficulty: Difficulty.MEDIUM,
        size: PuzzleSize.CLASSIC_9X9
      };

      const promises = Array(5).fill(null).map(() => generator.generatePuzzle(options));
      const puzzles = await Promise.all(promises);

      expect(puzzles).toHaveLength(5);
      
      // All puzzles should be valid and unique
      const ids = puzzles.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });
});

// Helper functions
function isValidSudokuState(grid: number[][]): boolean {
  const size = grid.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const value = grid[row][col];
      if (value !== 0) {
        // Temporarily remove the value to check if it's valid in this position
        grid[row][col] = 0;
        const isValid = isValidMove(grid, row, col, value, size);
        grid[row][col] = value; // Restore the value
        
        if (!isValid) {
          return false;
        }
      }
    }
  }
  
  return true;
}

function isValidCompleteSudoku(grid: number[][]): boolean {
  const size = grid.length;
  
  // Check if all cells are filled
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) {
        return false;
      }
    }
  }
  
  // Check if it's a valid Sudoku state
  return isValidSudokuState(grid);
}

function isValidMove(grid: number[][], row: number, col: number, num: number, size: number): boolean {
  // Check row
  for (let c = 0; c < size; c++) {
    if (grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < size; r++) {
    if (grid[r][col] === num) return false;
  }

  // Check box
  const boxSize = Math.sqrt(size);
  const boxRow = Math.floor(row / boxSize) * boxSize;
  const boxCol = Math.floor(col / boxSize) * boxSize;

  for (let r = boxRow; r < boxRow + boxSize; r++) {
    for (let c = boxCol; c < boxCol + boxSize; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
}

function countClues(grid: number[][]): number {
  let count = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] !== 0) {
        count++;
      }
    }
  }
  return count;
}