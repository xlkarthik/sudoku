/**
 * Core puzzle-related types and interfaces
 */
export declare enum PuzzleVariant {
    CLASSIC = "classic",
    KILLER = "killer",
    X_SUDOKU = "x-sudoku",
    HYPER = "hyper",
    MINI = "mini",
    MEGA = "mega"
}
export declare enum Difficulty {
    BEGINNER = "beginner",
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
    EXPERT = "expert"
}
export declare enum PuzzleSize {
    MINI_6X6 = 6,
    CLASSIC_9X9 = 9,
    MEGA_16X16 = 16
}
export declare enum SolvingTechnique {
    NAKED_SINGLES = "naked_singles",
    HIDDEN_SINGLES = "hidden_singles",
    NAKED_PAIRS = "naked_pairs",
    HIDDEN_PAIRS = "hidden_pairs",
    POINTING_PAIRS = "pointing_pairs",
    BOX_LINE_REDUCTION = "box_line_reduction",
    X_WING = "x_wing",
    SWORDFISH = "swordfish",
    XY_WING = "xy_wing",
    COLORING = "coloring",
    FORCING_CHAINS = "forcing_chains"
}
export interface Position {
    row: number;
    col: number;
}
export interface Constraint {
    type: 'cage' | 'diagonal' | 'extra_region';
    positions: Position[];
    value?: number;
    operation?: 'sum' | 'product' | 'difference';
}
export interface PuzzleMetadata {
    estimatedSolveTime: number;
    techniques: SolvingTechnique[];
    rating: number;
    playCount: number;
    averageSolveTime: number;
    createdBy?: string;
    tags?: string[];
}
export interface Puzzle {
    id: string;
    variant: PuzzleVariant;
    difficulty: Difficulty;
    size: PuzzleSize;
    initialState: number[][];
    solution: number[][];
    constraints: Constraint[];
    metadata: PuzzleMetadata;
    createdAt: Date;
    difficultyScore: number;
}
export interface PuzzleGenerationOptions {
    variant: PuzzleVariant;
    difficulty: Difficulty;
    size: PuzzleSize;
    seed?: string;
    constraints?: Constraint[];
}
//# sourceMappingURL=puzzle.d.ts.map