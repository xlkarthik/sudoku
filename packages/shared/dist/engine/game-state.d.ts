/**
 * Game state management with move tracking, undo/redo, timer, and pencil marks
 */
import { Position } from '../types/puzzle.js';
export interface GameMove {
    id: string;
    position: Position;
    previousValue: number;
    newValue: number;
    timestamp: Date;
    moveType: 'value' | 'pencil_mark' | 'clear';
    pencilMarks?: number[];
}
export interface GameTimer {
    startTime: Date | null;
    pausedTime: number;
    lastPauseTime: Date | null;
    isRunning: boolean;
    isPaused: boolean;
}
export interface CellState {
    value: number;
    isGiven: boolean;
    pencilMarks: Set<number>;
    isHighlighted: boolean;
    isSelected: boolean;
    hasError: boolean;
}
export interface GameStateSnapshot {
    id: string;
    grid: number[][];
    pencilMarks: Map<string, Set<number>>;
    timer: GameTimer;
    moveHistory: GameMove[];
    currentMoveIndex: number;
    timestamp: Date;
    score: number;
    mistakes: number;
}
export interface GameScore {
    score: number;
    mistakes: number;
    hintsUsed: number;
    timeBonus: number;
    difficultyMultiplier: number;
}
export declare class GameState {
    private grid;
    private initialGrid;
    private solutionGrid;
    private cellStates;
    private moveHistory;
    private currentMoveIndex;
    private timer;
    private size;
    private moveIdCounter;
    private snapshots;
    private maxSnapshots;
    private score;
    private mistakes;
    private hintsUsed;
    constructor(initialGrid: number[][], solutionGrid?: number[][]);
    /**
     * Initialize cell states based on the initial grid
     */
    private initializeCellStates;
    /**
     * Make a move on the grid
     */
    makeMove(row: number, col: number, value: number, moveType?: 'value' | 'clear'): boolean;
    /**
     * Toggle a pencil mark in a cell
     */
    togglePencilMark(row: number, col: number, value: number): boolean;
    /**
     * Undo the last move
     */
    undo(): boolean;
    /**
     * Redo the next move
     */
    redo(): boolean;
    /**
     * Start the game timer
     */
    startTimer(): void;
    /**
     * Pause the game timer
     */
    pauseTimer(): void;
    /**
     * Resume the game timer
     */
    resumeTimer(): void;
    /**
     * Stop the game timer
     */
    stopTimer(): void;
    /**
     * Get elapsed time in milliseconds
     */
    getElapsedTime(): number;
    /**
     * Create a snapshot of the current game state
     */
    createSnapshot(): string;
    /**
     * Restore from a snapshot
     */
    restoreSnapshot(snapshotId: string): boolean;
    /**
     * Get the current grid state
     */
    getGrid(): number[][];
    /**
     * Get cell state
     */
    getCellState(row: number, col: number): CellState;
    /**
     * Get all pencil marks for a cell
     */
    getPencilMarks(row: number, col: number): number[];
    /**
     * Check if the puzzle is complete
     */
    isComplete(): boolean;
    /**
     * Get move history
     */
    getMoveHistory(): GameMove[];
    /**
     * Get current move index
     */
    getCurrentMoveIndex(): number;
    /**
     * Check if undo is available
     */
    canUndo(): boolean;
    /**
     * Check if redo is available
     */
    canRedo(): boolean;
    /**
     * Get timer state
     */
    getTimerState(): GameTimer;
    /**
     * Clear all pencil marks from a cell
     */
    clearPencilMarks(row: number, col: number): boolean;
    /**
     * Set cell highlighting
     */
    setCellHighlight(row: number, col: number, highlighted: boolean): void;
    /**
     * Set cell selection
     */
    setCellSelection(row: number, col: number, selected: boolean): void;
    /**
     * Set cell error state
     */
    setCellError(row: number, col: number, hasError: boolean): void;
    private getCellKey;
    private isValidPosition;
    private generateMoveId;
    /**
     * Validate if a move is correct
     */
    private validateMove;
    /**
     * Check if a move is valid according to Sudoku rules
     */
    private isValidSudokuMove;
    /**
     * Calculate score for a move
     */
    private calculateMoveScore;
    /**
     * Get current score
     */
    getScore(): number;
    /**
     * Get number of mistakes
     */
    getMistakes(): number;
    /**
     * Get number of hints used
     */
    getHintsUsed(): number;
    /**
     * Use a hint
     */
    useHint(row: number, col: number): boolean;
    /**
     * Set the solution grid for validation
     */
    setSolution(solutionGrid: number[][]): void;
}
//# sourceMappingURL=game-state.d.ts.map