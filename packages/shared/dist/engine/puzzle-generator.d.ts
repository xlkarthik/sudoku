/**
 * Sudoku puzzle generation engine using constraint satisfaction algorithms
 */
import { Puzzle, PuzzleGenerationOptions } from '../types/puzzle.js';
export interface IPuzzleGenerator {
    generatePuzzle(options: PuzzleGenerationOptions): Promise<Puzzle>;
    validateUniqueSolution(grid: number[][]): boolean;
    calculateDifficulty(puzzle: Puzzle): number;
}
export declare class PuzzleGenerator implements IPuzzleGenerator {
    private readonly techniqueScores;
    generatePuzzle(options: PuzzleGenerationOptions): Promise<Puzzle>;
    validateUniqueSolution(grid: number[][]): boolean;
    calculateDifficulty(puzzle: Puzzle): number;
    private generateCompleteSolution;
    private solvePuzzle;
    private createPuzzleFromSolution;
    private createEasyPuzzle;
    private getBalancedRemovalOrder;
    private createHardPuzzle;
    private hasAnySolution;
    private calculateTargetClues;
    private findEmptyCell;
    private isValidMove;
    private findAllSolutions;
    private analyzeSolvingTechniques;
    private calculateDifficultyFromTechniques;
    private estimateSolveTime;
    private isGridComplete;
    private applyNakedSingles;
    private applyHiddenSingles;
    private applyNakedPairs;
    private getCandidates;
    private findHiddenSinglesInRow;
    private findHiddenSinglesInColumn;
    private findHiddenSinglesInBox;
    private shuffleArray;
    private generatePuzzleId;
}
//# sourceMappingURL=puzzle-generator.d.ts.map