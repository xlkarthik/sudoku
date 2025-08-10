/**
 * Sudoku puzzle solver and validation engine with optimization techniques
 */
import { SolvingTechnique } from '../types/puzzle.js';
export class PuzzleSolver {
    maxIterations = 1000;
    techniques = [
        SolvingTechnique.NAKED_SINGLES,
        SolvingTechnique.HIDDEN_SINGLES,
        SolvingTechnique.NAKED_PAIRS,
        SolvingTechnique.HIDDEN_PAIRS,
        SolvingTechnique.POINTING_PAIRS,
        SolvingTechnique.BOX_LINE_REDUCTION,
        SolvingTechnique.X_WING,
        SolvingTechnique.SWORDFISH,
        SolvingTechnique.XY_WING,
        SolvingTechnique.COLORING,
        SolvingTechnique.FORCING_CHAINS
    ];
    /**
     * Solve a Sudoku puzzle using logical techniques and backtracking
     */
    solvePuzzle(puzzle) {
        const startTime = Date.now();
        const workingGrid = puzzle.initialState.map(row => [...row]);
        const steps = [];
        const usedTechniques = new Set();
        // First try logical solving techniques
        let progress = true;
        let iterations = 0;
        while (progress && !this.isGridComplete(workingGrid) && iterations < this.maxIterations) {
            progress = false;
            iterations++;
            for (const technique of this.techniques) {
                const stepResult = this.applyTechnique(workingGrid, technique, puzzle.size);
                if (stepResult.applied) {
                    steps.push(...stepResult.steps);
                    usedTechniques.add(technique);
                    progress = true;
                    break; // Apply one technique at a time for better step tracking
                }
            }
        }
        // If logical techniques aren't enough, use backtracking (with timeout)
        if (!this.isGridComplete(workingGrid)) {
            const timeRemaining = 10000 - (Date.now() - startTime); // Max 10 seconds total
            if (timeRemaining > 1000) { // Only try backtracking if we have at least 1 second left
                const backtrackResult = this.solveWithBacktracking(workingGrid, puzzle.size);
                if (backtrackResult) {
                    usedTechniques.add(SolvingTechnique.FORCING_CHAINS); // Represent backtracking as forcing chains
                    steps.push({
                        technique: SolvingTechnique.FORCING_CHAINS,
                        position: { row: -1, col: -1 }, // Placeholder for backtracking
                        value: 0,
                        description: 'Completed using backtracking algorithm'
                    });
                }
            }
        }
        const timeElapsed = Math.max(1, Date.now() - startTime); // Ensure at least 1ms
        const solved = this.isGridComplete(workingGrid);
        return {
            solved,
            solution: solved ? workingGrid : undefined,
            steps,
            techniques: Array.from(usedTechniques),
            timeElapsed
        };
    }
    /**
     * Validate a puzzle state for correctness
     */
    validatePuzzle(grid) {
        const errors = [];
        const conflictingCells = [];
        const size = grid.length;
        // Check each cell for conflicts
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const value = grid[row][col];
                if (value !== 0) {
                    const conflicts = this.findConflicts(grid, row, col, value, size);
                    errors.push(...conflicts);
                    if (conflicts.length > 0) {
                        conflictingCells.push({ row, col });
                    }
                }
            }
        }
        const isComplete = this.isGridComplete(grid);
        const isValid = errors.length === 0;
        return {
            isValid,
            errors,
            isComplete,
            conflictingCells
        };
    }
    /**
     * Check if a puzzle has a unique solution
     */
    hasUniqueSolution(grid) {
        const solutions = [];
        const workingGrid = grid.map(row => [...row]);
        // Add timeout to prevent hanging
        const startTime = Date.now();
        const timeout = 5000; // 5 seconds max
        this.findAllSolutionsWithTimeout(workingGrid, grid.length, solutions, 2, startTime, timeout);
        return solutions.length === 1;
    }
    /**
     * Get all possible candidates for a cell
     */
    getCandidates(grid, row, col) {
        if (grid[row][col] !== 0) {
            return [];
        }
        const size = grid.length;
        const candidates = [];
        for (let num = 1; num <= size; num++) {
            if (this.isValidMove(grid, row, col, num, size)) {
                candidates.push(num);
            }
        }
        return candidates;
    }
    applyTechnique(grid, technique, size) {
        const steps = [];
        let applied = false;
        switch (technique) {
            case SolvingTechnique.NAKED_SINGLES:
                applied = this.applyNakedSingles(grid, size, steps);
                break;
            case SolvingTechnique.HIDDEN_SINGLES:
                applied = this.applyHiddenSingles(grid, size, steps);
                break;
            case SolvingTechnique.NAKED_PAIRS:
                applied = this.applyNakedPairs(grid, size, steps);
                break;
            case SolvingTechnique.HIDDEN_PAIRS:
                applied = this.applyHiddenPairs(grid, size, steps);
                break;
            default:
                // More advanced techniques would be implemented here
                applied = false;
                break;
        }
        return { applied, steps };
    }
    applyNakedSingles(grid, size, steps) {
        let progress = false;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0) {
                    const candidates = this.getCandidates(grid, row, col);
                    if (candidates.length === 1) {
                        const value = candidates[0];
                        grid[row][col] = value;
                        steps.push({
                            technique: SolvingTechnique.NAKED_SINGLES,
                            position: { row, col },
                            value,
                            candidates: [value],
                            description: `Naked single: only ${value} can go in cell (${row + 1}, ${col + 1})`
                        });
                        progress = true;
                    }
                }
            }
        }
        return progress;
    }
    applyHiddenSingles(grid, size, steps) {
        let progress = false;
        // Check rows
        for (let row = 0; row < size; row++) {
            progress = this.findHiddenSinglesInRow(grid, row, size, steps) || progress;
        }
        // Check columns
        for (let col = 0; col < size; col++) {
            progress = this.findHiddenSinglesInColumn(grid, col, size, steps) || progress;
        }
        // Check boxes
        const boxSize = Math.sqrt(size);
        if (boxSize === Math.floor(boxSize)) {
            for (let boxRow = 0; boxRow < size; boxRow += boxSize) {
                for (let boxCol = 0; boxCol < size; boxCol += boxSize) {
                    progress = this.findHiddenSinglesInBox(grid, boxRow, boxCol, boxSize, steps) || progress;
                }
            }
        }
        return progress;
    }
    applyNakedPairs(_grid, _size, _steps) {
        // Simplified implementation for now
        // In a full implementation, this would find cells with exactly 2 candidates
        // that are the same, and eliminate those candidates from other cells in the same unit
        return false;
    }
    applyHiddenPairs(_grid, _size, _steps) {
        // Simplified implementation for now
        // In a full implementation, this would find pairs of numbers that can only
        // go in two cells within a unit, and eliminate other candidates from those cells
        return false;
    }
    findHiddenSinglesInRow(grid, row, size, steps) {
        let progress = false;
        for (let num = 1; num <= size; num++) {
            const possibleCols = [];
            for (let col = 0; col < size; col++) {
                if (grid[row][col] === 0 && this.isValidMove(grid, row, col, num, size)) {
                    possibleCols.push(col);
                }
            }
            if (possibleCols.length === 1) {
                const col = possibleCols[0];
                grid[row][col] = num;
                steps.push({
                    technique: SolvingTechnique.HIDDEN_SINGLES,
                    position: { row, col },
                    value: num,
                    description: `Hidden single in row: ${num} can only go in cell (${row + 1}, ${col + 1})`
                });
                progress = true;
            }
        }
        return progress;
    }
    findHiddenSinglesInColumn(grid, col, size, steps) {
        let progress = false;
        for (let num = 1; num <= size; num++) {
            const possibleRows = [];
            for (let row = 0; row < size; row++) {
                if (grid[row][col] === 0 && this.isValidMove(grid, row, col, num, size)) {
                    possibleRows.push(row);
                }
            }
            if (possibleRows.length === 1) {
                const row = possibleRows[0];
                grid[row][col] = num;
                steps.push({
                    technique: SolvingTechnique.HIDDEN_SINGLES,
                    position: { row, col },
                    value: num,
                    description: `Hidden single in column: ${num} can only go in cell (${row + 1}, ${col + 1})`
                });
                progress = true;
            }
        }
        return progress;
    }
    findHiddenSinglesInBox(grid, startRow, startCol, boxSize, steps) {
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
                steps.push({
                    technique: SolvingTechnique.HIDDEN_SINGLES,
                    position: pos,
                    value: num,
                    description: `Hidden single in box: ${num} can only go in cell (${pos.row + 1}, ${pos.col + 1})`
                });
                progress = true;
            }
        }
        return progress;
    }
    solveWithBacktracking(grid, size, depth = 0) {
        // Prevent excessive recursion
        if (depth > 81)
            return false;
        const emptyCell = this.findEmptyCell(grid, size);
        if (!emptyCell) {
            return true; // Puzzle is complete
        }
        const [row, col] = emptyCell;
        // Try numbers 1 through size
        for (let num = 1; num <= size; num++) {
            if (this.isValidMove(grid, row, col, num, size)) {
                grid[row][col] = num;
                if (this.solveWithBacktracking(grid, size, depth + 1)) {
                    return true;
                }
                grid[row][col] = 0; // Backtrack
            }
        }
        return false;
    }
    // private findAllSolutions(grid: number[][], size: number, solutions: number[][][], maxSolutions: number, depth: number = 0): void {
    //   if (solutions.length >= maxSolutions || depth > 81) return;
    //   const emptyCell = this.findEmptyCell(grid, size);
    //   if (!emptyCell) {
    //     solutions.push(grid.map(row => [...row]));
    //     return;
    //   }
    //   const [row, col] = emptyCell;
    //   for (let num = 1; num <= size; num++) {
    //     if (this.isValidMove(grid, row, col, num, size)) {
    //       grid[row][col] = num;
    //       this.findAllSolutions(grid, size, solutions, maxSolutions, depth + 1);
    //       grid[row][col] = 0;
    //       if (solutions.length >= maxSolutions) return;
    //     }
    //   }
    // }
    findAllSolutionsWithTimeout(grid, size, solutions, maxSolutions, startTime, timeout, depth = 0) {
        if (solutions.length >= maxSolutions || depth > 81 || (Date.now() - startTime) > timeout)
            return;
        const emptyCell = this.findEmptyCell(grid, size);
        if (!emptyCell) {
            solutions.push(grid.map(row => [...row]));
            return;
        }
        const [row, col] = emptyCell;
        for (let num = 1; num <= size; num++) {
            if (this.isValidMove(grid, row, col, num, size)) {
                grid[row][col] = num;
                this.findAllSolutionsWithTimeout(grid, size, solutions, maxSolutions, startTime, timeout, depth + 1);
                grid[row][col] = 0;
                if (solutions.length >= maxSolutions || (Date.now() - startTime) > timeout)
                    return;
            }
        }
    }
    findConflicts(grid, row, col, value, size) {
        const errors = [];
        // Check for invalid value
        if (value < 1 || value > size) {
            errors.push({
                type: 'invalid_value',
                position: { row, col },
                value,
                message: `Invalid value ${value} at position (${row + 1}, ${col + 1}). Must be between 1 and ${size}.`
            });
            return errors;
        }
        // Check row conflicts
        for (let c = 0; c < size; c++) {
            if (c !== col && grid[row][c] === value) {
                errors.push({
                    type: 'duplicate_in_row',
                    position: { row, col },
                    value,
                    message: `Duplicate ${value} in row ${row + 1} at positions (${row + 1}, ${col + 1}) and (${row + 1}, ${c + 1})`
                });
            }
        }
        // Check column conflicts
        for (let r = 0; r < size; r++) {
            if (r !== row && grid[r][col] === value) {
                errors.push({
                    type: 'duplicate_in_column',
                    position: { row, col },
                    value,
                    message: `Duplicate ${value} in column ${col + 1} at positions (${row + 1}, ${col + 1}) and (${r + 1}, ${col + 1})`
                });
            }
        }
        // Check box conflicts
        const boxSize = Math.sqrt(size);
        if (boxSize === Math.floor(boxSize)) {
            const boxRow = Math.floor(row / boxSize) * boxSize;
            const boxCol = Math.floor(col / boxSize) * boxSize;
            for (let r = boxRow; r < boxRow + boxSize; r++) {
                for (let c = boxCol; c < boxCol + boxSize; c++) {
                    if ((r !== row || c !== col) && grid[r][c] === value) {
                        errors.push({
                            type: 'duplicate_in_box',
                            position: { row, col },
                            value,
                            message: `Duplicate ${value} in box at positions (${row + 1}, ${col + 1}) and (${r + 1}, ${c + 1})`
                        });
                    }
                }
            }
        }
        return errors;
    }
    isGridComplete(grid) {
        return grid.every(row => row.every(cell => cell !== 0));
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
        if (boxSize === Math.floor(boxSize)) {
            const boxRow = Math.floor(row / boxSize) * boxSize;
            const boxCol = Math.floor(col / boxSize) * boxSize;
            for (let r = boxRow; r < boxRow + boxSize; r++) {
                for (let c = boxCol; c < boxCol + boxSize; c++) {
                    if (grid[r][c] === num)
                        return false;
                }
            }
        }
        return true;
    }
}
//# sourceMappingURL=puzzle-solver.js.map