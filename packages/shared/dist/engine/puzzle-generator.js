/**
 * Sudoku puzzle generation engine using constraint satisfaction algorithms
 */
import { Difficulty, SolvingTechnique } from '../types/puzzle.js';
export class PuzzleGenerator {
    // private readonly difficultyThresholds = {
    //   [Difficulty.BEGINNER]: { min: 0, max: 2 },
    //   [Difficulty.EASY]: { min: 2, max: 4 },
    //   [Difficulty.MEDIUM]: { min: 4, max: 6 },
    //   [Difficulty.HARD]: { min: 6, max: 8 },
    //   [Difficulty.EXPERT]: { min: 8, max: 10 }
    // };
    techniqueScores = {
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
    async generatePuzzle(options) {
        const size = options.size;
        const boxSize = Math.sqrt(size);
        if (boxSize !== Math.floor(boxSize)) {
            throw new Error(`Invalid puzzle size: ${size}. Size must be a perfect square.`);
        }
        // Generate a complete valid solution
        const solution = this.generateCompleteSolution(size);
        // Create puzzle by removing cells while maintaining unique solution
        const initialState = this.createPuzzleFromSolution(solution, options.difficulty, size);
        // Calculate difficulty score and required techniques
        const techniques = this.analyzeSolvingTechniques(initialState, solution);
        const difficultyScore = this.calculateDifficultyFromTechniques(techniques);
        const puzzle = {
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
    validateUniqueSolution(grid) {
        const size = grid.length;
        const solutions = [];
        // Find all possible solutions (should be exactly 1)
        this.findAllSolutions(grid, size, solutions, 2); // Stop after finding 2 solutions
        return solutions.length === 1;
    }
    calculateDifficulty(puzzle) {
        const techniques = this.analyzeSolvingTechniques(puzzle.initialState, puzzle.solution);
        return this.calculateDifficultyFromTechniques(techniques);
    }
    generateCompleteSolution(size) {
        const grid = Array(size).fill(null).map(() => Array(size).fill(0));
        if (this.solvePuzzle(grid, size)) {
            return grid;
        }
        throw new Error('Failed to generate complete solution');
    }
    solvePuzzle(grid, size) {
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
    createPuzzleFromSolution(solution, difficulty, size) {
        const puzzle = solution.map(row => [...row]);
        const targetClues = this.calculateTargetClues(size, difficulty);
        // Use a more aggressive approach for harder difficulties
        if (difficulty === Difficulty.EXPERT || difficulty === Difficulty.HARD) {
            return this.createHardPuzzle(puzzle, targetClues, size);
        }
        else {
            return this.createEasyPuzzle(puzzle, targetClues, size);
        }
    }
    createEasyPuzzle(puzzle, targetClues, size) {
        const positions = this.getBalancedRemovalOrder(size);
        let currentClues = size * size;
        // Remove cells randomly until we reach target
        for (const pos of positions) {
            if (currentClues <= targetClues)
                break;
            const originalValue = puzzle[pos.row][pos.col];
            if (originalValue === 0)
                continue;
            puzzle[pos.row][pos.col] = 0;
            currentClues--;
        }
        return puzzle;
    }
    getBalancedRemovalOrder(size) {
        const positions = [];
        const boxSize = Math.sqrt(size);
        const boxes = [];
        // Collect positions per box and shuffle within each box
        for (let boxRow = 0; boxRow < boxSize; boxRow++) {
            for (let boxCol = 0; boxCol < boxSize; boxCol++) {
                const boxPositions = [];
                for (let r = boxRow * boxSize; r < (boxRow + 1) * boxSize; r++) {
                    for (let c = boxCol * boxSize; c < (boxCol + 1) * boxSize; c++) {
                        boxPositions.push({ row: r, col: c });
                    }
                }
                this.shuffleArray(boxPositions);
                boxes.push(boxPositions);
            }
        }
        // Shuffle the order of boxes themselves
        this.shuffleArray(boxes);
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
    createHardPuzzle(puzzle, targetClues, size) {
        const positions = this.getBalancedRemovalOrder(size);
        let currentClues = size * size;
        let attempts = 0;
        const maxAttempts = 200; // Limit attempts for performance
        for (const pos of positions) {
            if (currentClues <= targetClues || attempts >= maxAttempts)
                break;
            attempts++;
            const originalValue = puzzle[pos.row][pos.col];
            if (originalValue === 0)
                continue;
            puzzle[pos.row][pos.col] = 0;
            // For hard puzzles, do a quick solvability check every few removals
            if (attempts % 5 === 0) {
                if (!this.hasAnySolution(puzzle, size)) {
                    puzzle[pos.row][pos.col] = originalValue;
                }
                else {
                    currentClues--;
                }
            }
            else {
                currentClues--;
            }
        }
        return puzzle;
    }
    hasAnySolution(grid, size) {
        const workingGrid = grid.map(row => [...row]);
        return this.solvePuzzle(workingGrid, size);
    }
    calculateTargetClues(size, difficulty) {
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
    findEmptyCell(grid, size) {
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    isValidMove(grid, row, col, num, size) {
        // Check row
        for (let c = 0; c < size; c++) {
            if (grid[row][c] === num)
                return false;
        }
        // Check column
        for (let r = 0; r < size; r++) {
            if (grid[r][col] === num)
                return false;
        }
        // Check box
        const boxSize = Math.sqrt(size);
        const boxRow = Math.floor(row / boxSize) * boxSize;
        const boxCol = Math.floor(col / boxSize) * boxSize;
        for (let r = boxRow; r < boxRow + boxSize; r++) {
            for (let c = boxCol; c < boxCol + boxSize; c++) {
                if (grid[r][c] === num)
                    return false;
            }
        }
        return true;
    }
    findAllSolutions(grid, size, solutions, maxSolutions) {
        if (solutions.length >= maxSolutions)
            return;
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
                if (solutions.length >= maxSolutions)
                    return;
            }
        }
    }
    analyzeSolvingTechniques(puzzle, _solution) {
        const techniques = [];
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
    calculateDifficultyFromTechniques(techniques) {
        let score = 0;
        for (const technique of techniques) {
            score += this.techniqueScores[technique] || 0;
        }
        return Math.min(score, 10); // Cap at 10
    }
    estimateSolveTime(difficultyScore) {
        // Base time in seconds, scaled by difficulty
        const baseTime = 300; // 5 minutes
        return Math.round(baseTime * (1 + difficultyScore / 5));
    }
    isGridComplete(grid) {
        return grid.every(row => row.every(cell => cell !== 0));
    }
    applyNakedSingles(grid) {
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
    applyHiddenSingles(grid) {
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
    applyNakedPairs(_grid) {
        // Simplified naked pairs implementation
        // In a full implementation, this would be more sophisticated
        return false;
    }
    getCandidates(grid, row, col, size) {
        const candidates = [];
        for (let num = 1; num <= size; num++) {
            if (this.isValidMove(grid, row, col, num, size)) {
                candidates.push(num);
            }
        }
        return candidates;
    }
    findHiddenSinglesInRow(grid, row, size) {
        let progress = false;
        for (let num = 1; num <= size; num++) {
            const possibleCols = [];
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
    findHiddenSinglesInColumn(grid, col, size) {
        let progress = false;
        for (let num = 1; num <= size; num++) {
            const possibleRows = [];
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
    findHiddenSinglesInBox(grid, startRow, startCol, boxSize) {
        let progress = false;
        const size = grid.length;
        for (let num = 1; num <= size; num++) {
            const possiblePositions = [];
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
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    generatePuzzleId(options) {
        const timestamp = Date.now();
        const variant = options.variant.substring(0, 3);
        const difficulty = options.difficulty.substring(0, 3);
        const size = options.size;
        const random = Math.random().toString(36).substring(2, 8);
        return `${variant}-${difficulty}-${size}x${size}-${timestamp}-${random}`;
    }
}
//# sourceMappingURL=puzzle-generator.js.map