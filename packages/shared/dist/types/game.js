/**
 * Game state and gameplay-related types
 */
export var MoveType;
(function (MoveType) {
    MoveType["VALUE"] = "value";
    MoveType["PENCIL_MARK"] = "pencil_mark";
    MoveType["CLEAR"] = "clear";
    MoveType["CLEAR_PENCIL_MARKS"] = "clear_pencil_marks";
})(MoveType || (MoveType = {}));
export var HintType;
(function (HintType) {
    HintType["SHOW_CANDIDATES"] = "show_candidates";
    HintType["HIGHLIGHT_ERROR"] = "highlight_error";
    HintType["REVEAL_CELL"] = "reveal_cell";
    HintType["STRATEGY_HINT"] = "strategy_hint";
    HintType["NEXT_LOGICAL_STEP"] = "next_logical_step";
})(HintType || (HintType = {}));
export var GameStatus;
(function (GameStatus) {
    GameStatus["NOT_STARTED"] = "not_started";
    GameStatus["IN_PROGRESS"] = "in_progress";
    GameStatus["PAUSED"] = "paused";
    GameStatus["COMPLETED"] = "completed";
    GameStatus["ABANDONED"] = "abandoned";
})(GameStatus || (GameStatus = {}));
//# sourceMappingURL=game.js.map