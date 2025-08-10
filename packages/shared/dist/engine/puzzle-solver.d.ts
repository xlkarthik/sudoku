/**
 * Sudoku puzzle solver and validation engine with optimization techniques
 */
import { Puzzle, SolvingTechnique, Position } from '../types/puzzle.js';
export interface SolverResult {
    solved: boolean;
    solution?: number[][];
    steps: SolverStep[];
    techniques: SolvingTechnique[];
    timeElapsed: number;
}
export interface SolverStep {
    technique: SolvingTechnique;
    position: Position;
    value: number;
    candidates?: number[];
    description: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    isComplete: boolean;
    conflictingCells: Position[];
}
export interface ValidationError {
    type: 'duplicate_in_row' | 'duplicate_in_column' | 'duplicate_in_box' | 'invalid_value';
    position: Position;
    value: number;
    message: string;
}
export declare class PuzzleSolver {
    private readonly maxIterations;
    private readonly techniques;
    /**
     * Solve a Sudoku puzzle using logical techniques and backtracking
     */
    solvePuzzle(puzzle: Puzzle): SolverResult;
    /**
     * Validate a puzzle state for correctness
     */
    validatePuzzle(grid: number[][]): ValidationResult;
    /**
     * Check if a puzzle has a unique solution
     */
    hasUniqueSolution(grid: number[][]): boolean;
    /**
     * Get all possible candidates for a cell
     */
    getCandidates(grid: number[][], row: number, col: number): number[];
    private applyTechnique;
    private applyNakedSingles;
    private applyHiddenSingles;
    private applyNakedPairs;
    private applyHiddenPairs;
    private findHiddenSinglesInRow;
    private findHiddenSinglesInColumn;
    private findHiddenSinglesInBox;
    private solveWithBacktracking;
    private findAllSolutionsWithTimeout;
    private findConflicts;
    private isGridComplete;
    private findEmptyCell;
    private isValidMove;
}
//# sourceMappingURL=puzzle-solver.d.ts.map