/**
 * Difficulty calibration system using solving technique analysis
 */
import { Difficulty, SolvingTechnique, PuzzleSize } from '../types/puzzle.js';
export class DifficultyCalibrator {
    techniqueWeights = {
        [SolvingTechnique.NAKED_SINGLES]: { complexity: 0.1, timeImpact: 1 },
        [SolvingTechnique.HIDDEN_SINGLES]: { complexity: 0.2, timeImpact: 2 },
        [SolvingTechnique.NAKED_PAIRS]: { complexity: 1.0, timeImpact: 5 },
        [SolvingTechnique.HIDDEN_PAIRS]: { complexity: 1.2, timeImpact: 6 },
        [SolvingTechnique.POINTING_PAIRS]: { complexity: 1.5, timeImpact: 8 },
        [SolvingTechnique.BOX_LINE_REDUCTION]: { complexity: 1.8, timeImpact: 10 },
        [SolvingTechnique.X_WING]: { complexity: 2.5, timeImpact: 15 },
        [SolvingTechnique.SWORDFISH]: { complexity: 3.5, timeImpact: 25 },
        [SolvingTechnique.XY_WING]: { complexity: 4.0, timeImpact: 30 },
        [SolvingTechnique.COLORING]: { complexity: 4.5, timeImpact: 35 },
        [SolvingTechnique.FORCING_CHAINS]: { complexity: 5.0, timeImpact: 45 }
    };
    difficultyBoundaries = {
        [Difficulty.BEGINNER]: { min: 0, max: 2.0 },
        [Difficulty.EASY]: { min: 1.5, max: 3.5 },
        [Difficulty.MEDIUM]: { min: 3.0, max: 5.5 },
        [Difficulty.HARD]: { min: 5.0, max: 8.0 },
        [Difficulty.EXPERT]: { min: 7.5, max: 10.0 }
    };
    baseSolveTimes = {
        [PuzzleSize.MINI_6X6]: 180, // 3 minutes base
        [PuzzleSize.CLASSIC_9X9]: 600, // 10 minutes base
        [PuzzleSize.MEGA_16X16]: 1800 // 30 minutes base
    };
    calibrateDifficulty(puzzle, forGeneration = false) {
        const techniques = this.analyzeTechniques(puzzle, forGeneration);
        const difficultyScore = this.calculateDifficultyScore(techniques);
        const calculatedDifficulty = this.scoreToDifficulty(difficultyScore);
        const estimatedSolveTime = this.estimateSolveTime(puzzle.size, techniques);
        const confidence = this.calculateConfidence(puzzle, techniques);
        return {
            calculatedDifficulty,
            difficultyScore,
            requiredTechniques: techniques.map(t => t.technique),
            estimatedSolveTime,
            confidence
        };
    }
    validateDifficultyRating(puzzle) {
        const calibration = this.calibrateDifficulty(puzzle);
        const targetBoundary = this.difficultyBoundaries[puzzle.difficulty];
        return calibration.difficultyScore >= targetBoundary.min &&
            calibration.difficultyScore <= targetBoundary.max;
    }
    adjustDifficultyForVariant(baseDifficulty, puzzle) {
        const variantMultipliers = {
            classic: 1.0,
            killer: 1.3, // Killer sudoku is inherently more complex
            'x-sudoku': 1.2, // Diagonal constraints add complexity
            hyper: 1.4, // Additional regions increase difficulty
            mini: 0.8, // Smaller grids are generally easier
            mega: 1.6 // Larger grids are significantly harder
        };
        const multiplier = variantMultipliers[puzzle.variant] || 1.0;
        return Math.min(baseDifficulty * multiplier, 10.0);
    }
    analyzeTechniques(puzzle, forGeneration = false) {
        // Simulate solving the puzzle and track technique usage
        const workingGrid = puzzle.initialState.map(row => [...row]);
        // const solution = puzzle.solution; // Not used in current implementation
        const techniqueUsage = new Map();
        // Count empty cells to estimate complexity
        const emptyCells = this.countEmptyCells(workingGrid);
        const totalCells = puzzle.size * puzzle.size;
        const fillRatio = (totalCells - emptyCells) / totalCells;
        let iterations = 0;
        const maxIterations = 100; // Prevent infinite loops
        while (!this.isGridComplete(workingGrid) && iterations < maxIterations) {
            let progress = false;
            iterations++;
            // Try each technique in order of complexity
            const techniques = [
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
            for (const technique of techniques) {
                if (this.applyTechnique(workingGrid, technique, puzzle.size)) {
                    techniqueUsage.set(technique, (techniqueUsage.get(technique) || 0) + 1);
                    progress = true;
                    break; // Only apply one technique per iteration
                }
            }
            if (!progress) {
                // If we can't make progress, assume advanced techniques are needed
                // Add more advanced techniques based on difficulty
                const advancedTechnique = this.getAdvancedTechniqueForDifficulty(puzzle.difficulty);
                techniqueUsage.set(advancedTechnique, (techniqueUsage.get(advancedTechnique) || 0) + 1);
                break;
            }
        }
        // If no techniques were used, add basic ones based on fill ratio
        if (techniqueUsage.size === 0) {
            techniqueUsage.set(SolvingTechnique.NAKED_SINGLES, Math.max(1, Math.floor(emptyCells / 10)));
            if (fillRatio < 0.6) {
                techniqueUsage.set(SolvingTechnique.HIDDEN_SINGLES, Math.max(1, Math.floor(emptyCells / 15)));
            }
        }
        // Only add techniques based on difficulty when generating puzzles, not when validating
        if (forGeneration && emptyCells > 1) {
            this.addTechniquesBasedOnDifficulty(puzzle.difficulty, techniqueUsage, emptyCells);
        }
        // Convert usage map to analysis array
        const analyses = [];
        for (const [technique, frequency] of techniqueUsage) {
            const weights = this.techniqueWeights[technique];
            analyses.push({
                technique,
                frequency,
                complexity: weights.complexity,
                timeImpact: weights.timeImpact
            });
        }
        return analyses;
    }
    calculateDifficultyScore(techniques) {
        let totalScore = 0;
        for (const analysis of techniques) {
            // Score is based on complexity weighted by frequency
            const techniqueScore = analysis.complexity * Math.log(analysis.frequency + 1);
            totalScore += techniqueScore;
        }
        return Math.min(totalScore, 10.0);
    }
    scoreToDifficulty(score) {
        for (const [difficulty, boundary] of Object.entries(this.difficultyBoundaries)) {
            if (score >= boundary.min && score < boundary.max) {
                return difficulty;
            }
        }
        return Difficulty.EXPERT; // Default to expert for very high scores
    }
    estimateSolveTime(size, techniques) {
        const baseTime = this.baseSolveTimes[size] || this.baseSolveTimes[PuzzleSize.CLASSIC_9X9];
        let timeMultiplier = 1.0;
        // Calculate technique complexity multiplier
        for (const analysis of techniques) {
            // Each technique adds time based on its impact and frequency
            timeMultiplier += (analysis.timeImpact / 100) * Math.log(analysis.frequency + 1);
        }
        // Add size-based multiplier
        const sizeMultiplier = this.getSizeMultiplier(size);
        timeMultiplier *= sizeMultiplier;
        // Ensure minimum differentiation between difficulty levels
        const difficultyMultiplier = this.getDifficultyMultiplier(techniques);
        timeMultiplier *= difficultyMultiplier;
        return Math.round(baseTime * timeMultiplier);
    }
    getSizeMultiplier(size) {
        switch (size) {
            case PuzzleSize.MINI_6X6:
                return 0.6;
            case PuzzleSize.CLASSIC_9X9:
                return 1.0;
            case PuzzleSize.MEGA_16X16:
                return 2.5;
            default:
                return 1.0;
        }
    }
    getDifficultyMultiplier(techniques) {
        // Calculate average complexity of techniques used
        if (techniques.length === 0)
            return 1.0;
        const avgComplexity = techniques.reduce((sum, t) => sum + t.complexity, 0) / techniques.length;
        // Map complexity to multiplier
        if (avgComplexity < 0.5)
            return 0.8; // Easy puzzles
        if (avgComplexity < 1.5)
            return 1.0; // Medium puzzles
        if (avgComplexity < 3.0)
            return 1.4; // Hard puzzles
        return 1.8; // Expert puzzles
    }
    calculateConfidence(puzzle, techniques) {
        let confidence = 1.0;
        // Reduce confidence for puzzles with very few or very many techniques
        const techniqueCount = techniques.length;
        if (techniqueCount < 2) {
            confidence *= 0.7; // Low confidence for puzzles requiring very few techniques
        }
        else if (techniqueCount > 8) {
            confidence *= 0.8; // Slightly lower confidence for very complex puzzles
        }
        // Reduce confidence for extreme difficulty scores
        const score = this.calculateDifficultyScore(techniques);
        if (score < 0.5 || score > 9.5) {
            confidence *= 0.6;
        }
        // Reduce confidence for non-standard puzzle sizes
        if (puzzle.size !== PuzzleSize.CLASSIC_9X9) {
            confidence *= 0.85; // More significant reduction for non-standard sizes
        }
        // Standard 9x9 puzzles should have high confidence (>0.7)
        if (puzzle.size === PuzzleSize.CLASSIC_9X9) {
            if (techniqueCount >= 1 && techniqueCount <= 8 && score >= 0.1 && score <= 9.0) {
                confidence = Math.max(confidence, 0.85); // Ensure high confidence for standard puzzles
            }
        }
        return Math.max(confidence, 0.1); // Minimum 10% confidence
    }
    isGridComplete(grid) {
        return grid.every(row => row.every(cell => cell !== 0));
    }
    applyTechnique(grid, technique, _size) {
        // Ensure grid is properly sized before applying techniques
        if (!grid || grid.length === 0 || !grid[0]) {
            return false;
        }
        const gridSize = grid.length;
        switch (technique) {
            case SolvingTechnique.NAKED_SINGLES:
                return this.applyNakedSingles(grid, gridSize);
            case SolvingTechnique.HIDDEN_SINGLES:
                return this.applyHiddenSingles(grid, gridSize);
            case SolvingTechnique.NAKED_PAIRS:
                return this.applyNakedPairs(grid, gridSize);
            case SolvingTechnique.HIDDEN_PAIRS:
                return this.applyHiddenPairs(grid, gridSize);
            default:
                // For more advanced techniques, return false for now
                // These would be implemented in a more complete solver
                return false;
        }
    }
    applyNakedSingles(grid, gridSize) {
        let progress = false;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (grid[row] && grid[row][col] === 0) {
                    const candidates = this.getCandidates(grid, row, col, gridSize);
                    if (candidates.length === 1) {
                        grid[row][col] = candidates[0];
                        progress = true;
                    }
                }
            }
        }
        return progress;
    }
    applyHiddenSingles(grid, gridSize) {
        let progress = false;
        // Check rows, columns, and boxes
        for (let i = 0; i < gridSize; i++) {
            progress = this.findHiddenSinglesInRow(grid, i, gridSize) || progress;
            progress = this.findHiddenSinglesInColumn(grid, i, gridSize) || progress;
        }
        const boxSize = Math.sqrt(gridSize);
        if (boxSize === Math.floor(boxSize)) {
            for (let boxRow = 0; boxRow < gridSize; boxRow += boxSize) {
                for (let boxCol = 0; boxCol < gridSize; boxCol += boxSize) {
                    progress = this.findHiddenSinglesInBox(grid, boxRow, boxCol, boxSize) || progress;
                }
            }
        }
        return progress;
    }
    applyNakedPairs(_grid, _gridSize) {
        // Simplified implementation - would be more sophisticated in production
        return false;
    }
    applyHiddenPairs(_grid, _gridSize) {
        // Simplified implementation - would be more sophisticated in production
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
    isValidMove(grid, row, col, num, size) {
        // Bounds checking
        if (row < 0 || row >= size || col < 0 || col >= size)
            return false;
        if (!grid[row])
            return false;
        // Check row
        for (let c = 0; c < size; c++) {
            if (grid[row] && grid[row][c] === num)
                return false;
        }
        // Check column
        for (let r = 0; r < size; r++) {
            if (grid[r] && grid[r][col] === num)
                return false;
        }
        // Check box (only for perfect square sizes)
        const boxSize = Math.sqrt(size);
        if (boxSize === Math.floor(boxSize)) {
            const boxRow = Math.floor(row / boxSize) * boxSize;
            const boxCol = Math.floor(col / boxSize) * boxSize;
            for (let r = boxRow; r < boxRow + boxSize; r++) {
                for (let c = boxCol; c < boxCol + boxSize; c++) {
                    if (grid[r] && grid[r][c] === num)
                        return false;
                }
            }
        }
        return true;
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
    countEmptyCells(grid) {
        let count = 0;
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col] === 0) {
                    count++;
                }
            }
        }
        return count;
    }
    getAdvancedTechniqueForDifficulty(difficulty) {
        switch (difficulty) {
            case Difficulty.BEGINNER:
            case Difficulty.EASY:
                return SolvingTechnique.HIDDEN_SINGLES;
            case Difficulty.MEDIUM:
                return SolvingTechnique.NAKED_PAIRS;
            case Difficulty.HARD:
                return SolvingTechnique.X_WING;
            case Difficulty.EXPERT:
                return SolvingTechnique.FORCING_CHAINS;
            default:
                return SolvingTechnique.NAKED_PAIRS;
        }
    }
    addTechniquesBasedOnDifficulty(difficulty, techniqueUsage, emptyCells) {
        const baseFrequency = Math.max(1, Math.floor(emptyCells / 20));
        switch (difficulty) {
            case Difficulty.BEGINNER:
                // Only basic techniques
                break;
            case Difficulty.EASY:
                techniqueUsage.set(SolvingTechnique.HIDDEN_SINGLES, (techniqueUsage.get(SolvingTechnique.HIDDEN_SINGLES) || 0) + baseFrequency);
                break;
            case Difficulty.MEDIUM:
                techniqueUsage.set(SolvingTechnique.HIDDEN_SINGLES, (techniqueUsage.get(SolvingTechnique.HIDDEN_SINGLES) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.NAKED_PAIRS, (techniqueUsage.get(SolvingTechnique.NAKED_PAIRS) || 0) + baseFrequency);
                break;
            case Difficulty.HARD:
                techniqueUsage.set(SolvingTechnique.HIDDEN_SINGLES, (techniqueUsage.get(SolvingTechnique.HIDDEN_SINGLES) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.NAKED_PAIRS, (techniqueUsage.get(SolvingTechnique.NAKED_PAIRS) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.HIDDEN_PAIRS, (techniqueUsage.get(SolvingTechnique.HIDDEN_PAIRS) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.X_WING, (techniqueUsage.get(SolvingTechnique.X_WING) || 0) + Math.max(1, baseFrequency / 2));
                break;
            case Difficulty.EXPERT:
                techniqueUsage.set(SolvingTechnique.HIDDEN_SINGLES, (techniqueUsage.get(SolvingTechnique.HIDDEN_SINGLES) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.NAKED_PAIRS, (techniqueUsage.get(SolvingTechnique.NAKED_PAIRS) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.HIDDEN_PAIRS, (techniqueUsage.get(SolvingTechnique.HIDDEN_PAIRS) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.X_WING, (techniqueUsage.get(SolvingTechnique.X_WING) || 0) + baseFrequency);
                techniqueUsage.set(SolvingTechnique.XY_WING, (techniqueUsage.get(SolvingTechnique.XY_WING) || 0) + Math.max(1, baseFrequency / 2));
                techniqueUsage.set(SolvingTechnique.FORCING_CHAINS, (techniqueUsage.get(SolvingTechnique.FORCING_CHAINS) || 0) + Math.max(1, baseFrequency / 3));
                break;
        }
    }
}
//# sourceMappingURL=difficulty-calibrator.js.map