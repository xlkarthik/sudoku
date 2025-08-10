/**
 * Core puzzle-related types and interfaces
 */
export var PuzzleVariant;
(function (PuzzleVariant) {
    PuzzleVariant["CLASSIC"] = "classic";
    PuzzleVariant["KILLER"] = "killer";
    PuzzleVariant["X_SUDOKU"] = "x-sudoku";
    PuzzleVariant["HYPER"] = "hyper";
    PuzzleVariant["MINI"] = "mini";
    PuzzleVariant["MEGA"] = "mega";
})(PuzzleVariant || (PuzzleVariant = {}));
export var Difficulty;
(function (Difficulty) {
    Difficulty["BEGINNER"] = "beginner";
    Difficulty["EASY"] = "easy";
    Difficulty["MEDIUM"] = "medium";
    Difficulty["HARD"] = "hard";
    Difficulty["EXPERT"] = "expert";
})(Difficulty || (Difficulty = {}));
export var PuzzleSize;
(function (PuzzleSize) {
    PuzzleSize[PuzzleSize["MINI_6X6"] = 6] = "MINI_6X6";
    PuzzleSize[PuzzleSize["CLASSIC_9X9"] = 9] = "CLASSIC_9X9";
    PuzzleSize[PuzzleSize["MEGA_16X16"] = 16] = "MEGA_16X16";
})(PuzzleSize || (PuzzleSize = {}));
export var SolvingTechnique;
(function (SolvingTechnique) {
    SolvingTechnique["NAKED_SINGLES"] = "naked_singles";
    SolvingTechnique["HIDDEN_SINGLES"] = "hidden_singles";
    SolvingTechnique["NAKED_PAIRS"] = "naked_pairs";
    SolvingTechnique["HIDDEN_PAIRS"] = "hidden_pairs";
    SolvingTechnique["POINTING_PAIRS"] = "pointing_pairs";
    SolvingTechnique["BOX_LINE_REDUCTION"] = "box_line_reduction";
    SolvingTechnique["X_WING"] = "x_wing";
    SolvingTechnique["SWORDFISH"] = "swordfish";
    SolvingTechnique["XY_WING"] = "xy_wing";
    SolvingTechnique["COLORING"] = "coloring";
    SolvingTechnique["FORCING_CHAINS"] = "forcing_chains";
})(SolvingTechnique || (SolvingTechnique = {}));
//# sourceMappingURL=puzzle.js.map