/**
 * Sudoku puzzle generation engine using constraint satisfaction algorithms
 */

import { 
  Puzzle, 
  PuzzleGenerationOptions, 
  Difficulty, 
  SolvingTechnique,
  Position
} from '../types/puzzle.js';

export interface IPuzzleGenerator {
  generatePuzzle(options: PuzzleGenerationOptions): Promise<Puzzle>;
  validateUniqueSolution(grid: number[][]): boolean;
  calculateDifficulty(puzzle: Puzzle): number;
}

export class PuzzleGenerator implements IPuzzleGenerator {
  // private readonly difficultyThresholds = {
  //   [Difficulty.BEGINNER]: { min: 0, max: 2 },
  //   [Difficulty.EASY]: { min: 2, max: 4 },
  //   [Difficulty.MEDIUM]: { min: 4, max: 6 },
  //   [Difficulty.HARD]: { min: 6, max: 8 },
  //   [Difficulty.EXPERT]: { min: 8, max: 10 }
  // };

  private readonly techniqueScores = {
    [SolvingTechnique.NAKED_SINGLES]: 0.1,
    [SolvingTechnique.HIDDEN_SINGLES]: 0.2,
    [SolvingTechnique.NAKED_PAIRS]: 1.0,
    [SolvingTechnique.HIDDEN_PAIRS]: 1.2,
    [SolvingTechnique.POINTING_PAIRS]: 1.5,
    [SolvingTechnique.BOX_LINE_REDUCTION]: 1.8,
    [SolvingTechnique.X_WING]: 2.5,
    [SolvingTechnique.SWORDFISH]: 3.5,
    [SolvingTechnique.XY_WING]: 4.0,
    [SolvingTechnique.COLORING]: 4.5,
    [SolvingTechnique.FORCING_CHAINS]: 5.0
  };

  async generatePuzzle(options: PuzzleGenerationOptions): Promise<Puzzle> {
    const size = options.size;
    const boxSize = Math.sqrt(size);
    
    if (boxSize !== Math.floor(boxSize)) {
      throw new Error(`Invalid puzzle size: ${size}. Size must be a perfect square.`);
    }

    // Apply a random permutation of rows/cols within bands/stacks to break visual patterns
    const rowPerm = this.generateBandWisePermutation(size);
    const colPerm = this.generateBandWisePermutation(size);

    // Generate a complete valid solution
    let solution = this.generateCompleteSolution(size);
    // Permute solution to randomize pattern orientation
    solution = this.applyPermutation(solution, rowPerm, colPerm);
    
    // Create puzzle by removing cells while maintaining unique solution
    let initialState = this.createPuzzleFromSolution(solution.map(r => [...r]), options.difficulty, size);
    // Unpermute back to canonical order so consumers don't need to know permutations
    initialState = this.applyPermutation(initialState, this.invertPermutation(rowPerm), this.invertPermutation(colPerm));
    solution = this.applyPermutation(solution, this.invertPermutation(rowPerm), this.invertPermutation(colPerm));
    
    // Calculate difficulty score and required techniques
    const techniques = this.analyzeSolvingTechniques(initialState, solution);
    const difficultyScore = this.calculateDifficultyFromTechniques(techniques);
    
    const puzzle: Puzzle = {
      id: this.generatePuzzleId(options),
      variant: options.variant,
      difficulty: options.difficulty,
      size: options.size,
      initialState,
      solution,
      constraints: options.constraints || [],
      metadata: {
        estimatedSolveTime: this.estimateSolveTime(difficultyScore),
        techniques,
        rating: Math.round(difficultyScore * 10) / 10,
        playCount: 0,
        averageSolveTime: 0,
        tags: [`${options.variant}`, `${options.difficulty}`]
      },
      createdAt: new Date(),
      difficultyScore
    };

    return puzzle;
  }

  validateUniqueSolution(grid: number[][]): boolean {
    const size = grid.length;
    const solutions: number[][][] = [];
    
    // Find all possible solutions (should be exactly 1)
    this.findAllSolutions(grid, size, solutions, 2); // Stop after finding 2 solutions
    
    return solutions.length === 1;
  }

  calculateDifficulty(puzzle: Puzzle): number {
    const techniques = this.analyzeSolvingTechniques(puzzle.initialState, puzzle.solution);
    return this.calculateDifficultyFromTechniques(techniques);
  }

  private generateCompleteSolution(size: number): number[][] {
    const grid = Array(size).fill(null).map(() => Array(size).fill(0));
    
    if (this.solvePuzzle(grid, size)) {
      return grid;
    }
    
    throw new Error('Failed to generate complete solution');
  }

  private solvePuzzle(grid: number[][], size: number): boolean {
    const emptyCell = this.findEmptyCell(grid, size);
    if (!emptyCell) {
      return true; // Puzzle is complete
    }

    const [row, col] = emptyCell;
    const numbers = this.shuffleArray([...Array(size)].map((_, i) => i + 1));

    for (const num of numbers) {
      if (this.isValidMove(grid, row, col, num, size)) {
        grid[row][col] = num;
        
        if (this.solvePuzzle(grid, size)) {
          return true;
        }
        
        grid[row][col] = 0; // Backtrack
      }
    }

    return false;
  }

  private createPuzzleFromSolution(solution: number[][], difficulty: Difficulty, size: number): number[][] {
    const puzzle = solution.map(row => [...row]);
    const targetClues = this.calculateTargetClues(size, difficulty);
    
    // Use a more aggressive approach for harder difficulties
    if (difficulty === Difficulty.EXPERT || difficulty === Difficulty.HARD) {
      return this.createHardPuzzle(puzzle, targetClues, size);
    } else {
      return this.createEasyPuzzle(puzzle, targetClues, size);
    }
  }

  private createEasyPuzzle(puzzle: number[][], targetClues: number, size: number): number[][] {
    const positions = this.getBalancedRemovalOrder(size);
    let currentClues = size * size;
    
    // Remove cells randomly until we reach target
    for (const pos of positions) {
      if (currentClues <= targetClues) break;

      const originalValue = puzzle[pos.row][pos.col];
      if (originalValue === 0) continue;

      puzzle[pos.row][pos.col] = 0;
      currentClues--;
    }

    return puzzle;
  }

  private getBalancedRemovalOrder(size: number): Position[] {
    const positions: Position[] = [];
    const boxSize = Math.sqrt(size);
    const boxes: Position[][] = [];

    // Collect positions per box and shuffle within each box
    for (let boxRow = 0; boxRow < boxSize; boxRow++) {
      for (let boxCol = 0; boxCol < boxSize; boxCol++) {
        let boxPositions: Position[] = [];
        for (let r = boxRow * boxSize; r < (boxRow + 1) * boxSize; r++) {
          for (let c = boxCol * boxSize; c < (boxCol + 1) * boxSize; c++) {
            boxPositions.push({ row: r, col: c });
          }
        }
        boxPositions = this.shuffleArray(boxPositions);
        boxes.push(boxPositions);
      }
    }

    // Shuffle the order of boxes themselves
    const shuffledBoxes = this.shuffleArray(boxes);
    boxes.length = 0;
    for (const b of shuffledBoxes) boxes.push(b);

    // Interleave removals across boxes (round-robin) to avoid clustering
    let remaining = boxes.reduce((sum, b) => sum + b.length, 0);
    let step = 0;
    while (remaining > 0) {
      // Occasionally reverse traversal direction to break patterns
      const traverse = step % 2 === 0 ? boxes : [...boxes].reverse();
      step++;
      for (const box of traverse) {
        const cell = box.pop();
        if (cell) {
          positions.push(cell);
          remaining--;
        }
      }
    }

    return positions;
  }

  // private getEmptyCells(puzzle: number[][], size: number): Position[] {
  //   const emptyCells: Position[] = [];
  //   for (let row = 0; row < size; row++) {
  //     for (let col = 0; col < size; col++) {
  //       if (puzzle[row][col] === 0) {
  //         emptyCells.push({ row, col });
  //       }
  //     }
  //   }
  //   return emptyCells;
  // }

  private createHardPuzzle(puzzle: number[][], targetClues: number, size: number): number[][] {
    const positions = this.getBalancedRemovalOrder(size);
    let currentClues = size * size;
    let attempts = 0;
    const maxAttempts = 200; // Limit attempts for performance

    for (const pos of positions) {
      if (currentClues <= targetClues || attempts >= maxAttempts) break;
      attempts++;

      const originalValue = puzzle[pos.row][pos.col];
      if (originalValue === 0) continue;

      puzzle[pos.row][pos.col] = 0;

      // For hard puzzles, do a quick solvability check every few removals
      if (attempts % 5 === 0) {
        if (!this.hasAnySolution(puzzle, size)) {
          puzzle[pos.row][pos.col] = originalValue;
        } else {
          currentClues--;
        }
      } else {
        currentClues--;
      }
    }

    return puzzle;
  }

  private hasAnySolution(grid: number[][], size: number): boolean {
    const workingGrid = grid.map(row => [...row]);
    return this.solvePuzzle(workingGrid, size);
  }

  private calculateTargetClues(size: number, difficulty: Difficulty): number {
    // For 9x9 Sudoku, typical clue counts:
    // Beginner: 50-60 clues
    // Easy: 36-46 clues  
    // Medium: 32-35 clues
    // Hard: 28-31 clues
    // Expert: 22-27 clues
    
    if (size === 9) {
      const clueRanges = {
        [Difficulty.BEGINNER]: { min: 50, max: 60 },
        [Difficulty.EASY]: { min: 36, max: 46 },
        [Difficulty.MEDIUM]: { min: 32, max: 35 },
        [Difficulty.HARD]: { min: 28, max: 31 },
        [Difficulty.EXPERT]: { min: 22, max: 27 }
      };
      
      const range = clueRanges[difficulty];
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
    
    // For other sizes, use ratios
    const totalCells = size * size;
    const clueRatios = {
      [Difficulty.BEGINNER]: 0.65,
      [Difficulty.EASY]: 0.50,
      [Difficulty.MEDIUM]: 0.40,
      [Difficulty.HARD]: 0.32,
      [Difficulty.EXPERT]: 0.28
    };
    
    return Math.floor(totalCells * clueRatios[difficulty]);
  }

  private findEmptyCell(grid: number[][], size: number): [number, number] | null {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
  }

  private isValidMove(grid: number[][], row: number, col: number, num: number, size: number): boolean {
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

  private findAllSolutions(grid: number[][], size: number, solutions: number[][][], maxSolutions: number): void {
    if (solutions.length >= maxSolutions) return;

    const emptyCell = this.findEmptyCell(grid, size);
    if (!emptyCell) {
      // Found a complete solution
      solutions.push(grid.map(row => [...row]));
      return;
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= size; num++) {
      if (this.isValidMove(grid, row, col, num, size)) {
        grid[row][col] = num;
        this.findAllSolutions(grid, size, solutions, maxSolutions);
        grid[row][col] = 0; // Backtrack
        
        if (solutions.length >= maxSolutions) return;
      }
    }
  }

  private analyzeSolvingTechniques(puzzle: number[][], _solution: number[][]): SolvingTechnique[] {
    const techniques: SolvingTechnique[] = [];
    const workingGrid = puzzle.map(row => [...row]);
    
    // Simulate solving and track which techniques are needed
    while (!this.isGridComplete(workingGrid)) {
      let progress = false;

      // Try naked singles
      if (this.applyNakedSingles(workingGrid)) {
        if (!techniques.includes(SolvingTechnique.NAKED_SINGLES)) {
          techniques.push(SolvingTechnique.NAKED_SINGLES);
        }
        progress = true;
        continue;
      }

      // Try hidden singles
      if (this.applyHiddenSingles(workingGrid)) {
        if (!techniques.includes(SolvingTechnique.HIDDEN_SINGLES)) {
          techniques.push(SolvingTechnique.HIDDEN_SINGLES);
        }
        progress = true;
        continue;
      }

      // Try more advanced techniques if basic ones don't work
      if (this.applyNakedPairs(workingGrid)) {
        if (!techniques.includes(SolvingTechnique.NAKED_PAIRS)) {
          techniques.push(SolvingTechnique.NAKED_PAIRS);
        }
        progress = true;
        continue;
      }

      // If no progress can be made with implemented techniques, break
      if (!progress) {
        // For now, assume more advanced techniques are needed
        techniques.push(SolvingTechnique.FORCING_CHAINS);
        break;
      }
    }

    return techniques;
  }

  private calculateDifficultyFromTechniques(techniques: SolvingTechnique[]): number {
    let score = 0;
    for (const technique of techniques) {
      score += this.techniqueScores[technique] || 0;
    }
    return Math.min(score, 10); // Cap at 10
  }

  private estimateSolveTime(difficultyScore: number): number {
    // Base time in seconds, scaled by difficulty
    const baseTime = 300; // 5 minutes
    return Math.round(baseTime * (1 + difficultyScore / 5));
  }

  private isGridComplete(grid: number[][]): boolean {
    return grid.every(row => row.every(cell => cell !== 0));
  }

  private applyNakedSingles(grid: number[][]): boolean {
    const size = grid.length;
    let progress = false;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0) {
          const candidates = this.getCandidates(grid, row, col, size);
          if (candidates.length === 1) {
            grid[row][col] = candidates[0];
            progress = true;
          }
        }
      }
    }

    return progress;
  }

  private applyHiddenSingles(grid: number[][]): boolean {
    const size = grid.length;
    let progress = false;

    // Check rows, columns, and boxes for hidden singles
    for (let i = 0; i < size; i++) {
      progress = this.findHiddenSinglesInRow(grid, i, size) || progress;
      progress = this.findHiddenSinglesInColumn(grid, i, size) || progress;
    }

    const boxSize = Math.sqrt(size);
    for (let boxRow = 0; boxRow < size; boxRow += boxSize) {
      for (let boxCol = 0; boxCol < size; boxCol += boxSize) {
        progress = this.findHiddenSinglesInBox(grid, boxRow, boxCol, boxSize) || progress;
      }
    }

    return progress;
  }

  private applyNakedPairs(_grid: number[][]): boolean {
    // Simplified naked pairs implementation
    // In a full implementation, this would be more sophisticated
    return false;
  }

  private getCandidates(grid: number[][], row: number, col: number, size: number): number[] {
    const candidates: number[] = [];
    
    for (let num = 1; num <= size; num++) {
      if (this.isValidMove(grid, row, col, num, size)) {
        candidates.push(num);
      }
    }
    
    return candidates;
  }

  private findHiddenSinglesInRow(grid: number[][], row: number, size: number): boolean {
    let progress = false;
    
    for (let num = 1; num <= size; num++) {
      const possibleCols: number[] = [];
      
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === 0 && this.isValidMove(grid, row, col, num, size)) {
          possibleCols.push(col);
        }
      }
      
      if (possibleCols.length === 1) {
        grid[row][possibleCols[0]] = num;
        progress = true;
      }
    }
    
    return progress;
  }

  private findHiddenSinglesInColumn(grid: number[][], col: number, size: number): boolean {
    let progress = false;
    
    for (let num = 1; num <= size; num++) {
      const possibleRows: number[] = [];
      
      for (let row = 0; row < size; row++) {
        if (grid[row][col] === 0 && this.isValidMove(grid, row, col, num, size)) {
          possibleRows.push(row);
        }
      }
      
      if (possibleRows.length === 1) {
        grid[possibleRows[0]][col] = num;
        progress = true;
      }
    }
    
    return progress;
  }

  private findHiddenSinglesInBox(grid: number[][], startRow: number, startCol: number, boxSize: number): boolean {
    let progress = false;
    const size = grid.length;
    
    for (let num = 1; num <= size; num++) {
      const possiblePositions: Position[] = [];
      
      for (let r = startRow; r < startRow + boxSize; r++) {
        for (let c = startCol; c < startCol + boxSize; c++) {
          if (grid[r][c] === 0 && this.isValidMove(grid, r, c, num, size)) {
            possiblePositions.push({ row: r, col: c });
          }
        }
      }
      
      if (possiblePositions.length === 1) {
        const pos = possiblePositions[0];
        grid[pos.row][pos.col] = num;
        progress = true;
      }
    }
    
    return progress;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateBandWisePermutation(size: number): number[] {
    const box = Math.sqrt(size);
    const bands = Array.from({ length: box }, (_, b) => {
      const within = this.shuffleArray(Array.from({ length: box }, (_, i) => b * box + i));
      return within;
    });
    const bandOrder = this.shuffleArray(Array.from({ length: box }, (_, i) => i));
    const permuted: number[] = [];
    for (const b of bandOrder) {
      permuted.push(...bands[b]);
    }
    return permuted;
  }

  private invertPermutation(perm: number[]): number[] {
    const inv = Array(perm.length).fill(0);
    for (let i = 0; i < perm.length; i++) inv[perm[i]] = i;
    return inv;
  }

  private applyPermutation(grid: number[][], rowPerm: number[], colPerm: number[]): number[][] {
    const size = grid.length;
    const out = Array.from({ length: size }, () => Array(size).fill(0));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        out[rowPerm[r]] = out[rowPerm[r]] || Array(size).fill(0);
        out[rowPerm[r]][colPerm[c]] = grid[r][c];
      }
    }
    return out;
  }

  private generatePuzzleId(options: PuzzleGenerationOptions): string {
    const timestamp = Date.now();
    const variant = options.variant.substring(0, 3);
    const difficulty = options.difficulty.substring(0, 3);
    const size = options.size;
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${variant}-${difficulty}-${size}x${size}-${timestamp}-${random}`;
  }
}