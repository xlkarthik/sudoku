/**
 * Game state and gameplay-related types
 */
import { Position } from './puzzle.js';
export declare enum MoveType {
    VALUE = "value",
    PENCIL_MARK = "pencil_mark",
    CLEAR = "clear",
    CLEAR_PENCIL_MARKS = "clear_pencil_marks"
}
export declare enum HintType {
    SHOW_CANDIDATES = "show_candidates",
    HIGHLIGHT_ERROR = "highlight_error",
    REVEAL_CELL = "reveal_cell",
    STRATEGY_HINT = "strategy_hint",
    NEXT_LOGICAL_STEP = "next_logical_step"
}
export declare enum GameStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    PAUSED = "paused",
    COMPLETED = "completed",
    ABANDONED = "abandoned"
}
export interface CellState {
    value: number | null;
    isGiven: boolean;
    isError: boolean;
    candidates: number[];
    isHighlighted: boolean;
}
export interface Move {
    id: string;
    position: Position;
    previousValue: number | null;
    newValue: number | null;
    previousCandidates: number[];
    newCandidates: number[];
    moveType: MoveType;
    timestamp: Date;
    isUndo: boolean;
}
export interface PencilMark {
    position: Position;
    candidates: number[];
}
export interface Hint {
    type: HintType;
    position?: Position;
    value?: number;
    candidates?: number[];
    explanation: string;
    technique?: string;
    affectedCells?: Position[];
}
export interface GameTimer {
    startTime: Date | null;
    pausedTime: number;
    currentPauseStart: Date | null;
    isRunning: boolean;
}
export interface GameState {
    id: string;
    puzzleId: string;
    userId: string;
    currentGrid: CellState[][];
    moveHistory: Move[];
    timer: GameTimer;
    status: GameStatus;
    hintsUsed: number;
    mistakeCount: number;
    score: number;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface MoveResult {
    success: boolean;
    error?: string;
    gameState: GameState;
    isComplete: boolean;
    conflicts?: Position[];
}
export interface ValidationResult {
    isValid: boolean;
    conflicts: Position[];
    errorMessage?: string;
}
//# sourceMappingURL=game.d.ts.map