/**
 * Difficulty calibration system using solving technique analysis
 */
import { Puzzle, Difficulty, SolvingTechnique } from '../types/puzzle.js';
export interface DifficultyCalibrationResult {
    calculatedDifficulty: Difficulty;
    difficultyScore: number;
    requiredTechniques: SolvingTechnique[];
    estimatedSolveTime: number;
    confidence: number;
}
export interface TechniqueAnalysis {
    technique: SolvingTechnique;
    frequency: number;
    complexity: number;
    timeImpact: number;
}
export declare class DifficultyCalibrator {
    private readonly techniqueWeights;
    private readonly difficultyBoundaries;
    private readonly baseSolveTimes;
    calibrateDifficulty(puzzle: Puzzle, forGeneration?: boolean): DifficultyCalibrationResult;
    validateDifficultyRating(puzzle: Puzzle): boolean;
    adjustDifficultyForVariant(baseDifficulty: number, puzzle: Puzzle): number;
    private analyzeTechniques;
    private calculateDifficultyScore;
    private scoreToDifficulty;
    private estimateSolveTime;
    private getSizeMultiplier;
    private getDifficultyMultiplier;
    private calculateConfidence;
    private isGridComplete;
    private applyTechnique;
    private applyNakedSingles;
    private applyHiddenSingles;
    private applyNakedPairs;
    private applyHiddenPairs;
    private getCandidates;
    private isValidMove;
    private findHiddenSinglesInRow;
    private findHiddenSinglesInColumn;
    private findHiddenSinglesInBox;
    private countEmptyCells;
    private getAdvancedTechniqueForDifficulty;
    private addTechniquesBasedOnDifficulty;
}
//# sourceMappingURL=difficulty-calibrator.d.ts.map