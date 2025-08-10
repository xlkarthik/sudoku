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
  pausedTime: number; // Total paused time in milliseconds
  lastPauseTime: Date | null; // When the current pause started
  isRunning: boolean;
  isPaused: boolean;
}

export interface CellState {
  value: number;
  isGiven: boolean; // True if this was part of the initial puzzle
  pencilMarks: Set<number>;
  isHighlighted: boolean;
  isSelected: boolean;
  hasError: boolean;
}

export interface GameStateSnapshot {
  id: string;
  grid: number[][];
  pencilMarks: Map<string, Set<number>>; // Key: "row,col"
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

export class GameState {
  private grid: number[][];
  private initialGrid: number[][];
  private solutionGrid: number[][] | null = null;
  private cellStates: Map<string, CellState>;
  private moveHistory: GameMove[] = [];
  private currentMoveIndex: number = -1;
  private timer: GameTimer;
  private size: number;
  private moveIdCounter: number = 0;
  private snapshots: GameStateSnapshot[] = [];
  private maxSnapshots: number = 10;
  private score: number = 0;
  private mistakes: number = 0;
  private hintsUsed: number = 0;

  constructor(initialGrid: number[][], solutionGrid?: number[][]) {
    this.size = initialGrid.length;
    this.initialGrid = initialGrid.map(row => [...row]);
    this.grid = initialGrid.map(row => [...row]);
    this.solutionGrid = solutionGrid ? solutionGrid.map(row => [...row]) : null;
    this.cellStates = new Map();
    this.timer = {
      startTime: null,
      pausedTime: 0,
      lastPauseTime: null,
      isRunning: false,
      isPaused: false
    };

    this.initializeCellStates();
  }

  /**
   * Initialize cell states based on the initial grid
   */
  private initializeCellStates(): void {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const key = this.getCellKey(row, col);
        this.cellStates.set(key, {
          value: this.grid[row][col],
          isGiven: this.initialGrid[row][col] !== 0,
          pencilMarks: new Set(),
          isHighlighted: false,
          isSelected: false,
          hasError: false
        });
      }
    }
  }

  /**
   * Make a move on the grid
   */
  makeMove(row: number, col: number, value: number, moveType: 'value' | 'clear' = 'value'): boolean {
    if (!this.isValidPosition(row, col)) {
      return false;
    }

    const cellState = this.getCellState(row, col);
    if (cellState.isGiven) {
      return false; // Cannot modify given cells
    }

    const previousValue = this.grid[row][col];
    if (previousValue === value && moveType === 'value') {
      return false; // No change
    }

    // Clear moves ahead of current position (for redo functionality)
    this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);

    // Create the move
    const move: GameMove = {
      id: this.generateMoveId(),
      position: { row, col },
      previousValue,
      newValue: moveType === 'clear' ? 0 : value,
      timestamp: new Date(),
      moveType,
      pencilMarks: moveType === 'clear' ? Array.from(cellState.pencilMarks) : undefined
    };

    // Apply the move
    this.grid[row][col] = move.newValue;
    cellState.value = move.newValue;
    
    if (moveType === 'clear') {
      cellState.pencilMarks.clear();
      cellState.hasError = false;
    } else if (moveType === 'value' && value !== 0) {
      cellState.pencilMarks.clear(); // Clear pencil marks when placing a value
      
      // Real-time validation and scoring
      const isCorrect = this.validateMove(row, col, value);
      cellState.hasError = !isCorrect;
      
      if (isCorrect) {
        // Award points for correct move
        this.score += this.calculateMoveScore(value);
      } else {
        // Penalize for mistake
        this.mistakes++;
        this.score = Math.max(0, this.score - 10); // Lose 10 points for mistake
      }
    }

    // Add to history
    this.moveHistory.push(move);
    this.currentMoveIndex++;

    // Start timer if not already running
    if (!this.timer.isRunning && !this.timer.isPaused) {
      this.startTimer();
    }

    return true;
  }

  /**
   * Toggle a pencil mark in a cell
   */
  togglePencilMark(row: number, col: number, value: number): boolean {
    if (!this.isValidPosition(row, col) || value < 1 || value > this.size) {
      return false;
    }

    const cellState = this.getCellState(row, col);
    if (cellState.isGiven || cellState.value !== 0) {
      return false; // Cannot add pencil marks to given cells or cells with values
    }

    const hadMark = cellState.pencilMarks.has(value);
    const previousMarks = Array.from(cellState.pencilMarks);

    if (hadMark) {
      cellState.pencilMarks.delete(value);
    } else {
      cellState.pencilMarks.add(value);
    }

    // Create move for pencil mark change
    const move: GameMove = {
      id: this.generateMoveId(),
      position: { row, col },
      previousValue: 0,
      newValue: 0,
      timestamp: new Date(),
      moveType: 'pencil_mark',
      pencilMarks: previousMarks
    };

    // Clear moves ahead and add to history
    this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);
    this.moveHistory.push(move);
    this.currentMoveIndex++;

    return true;
  }

  /**
   * Undo the last move
   */
  undo(): boolean {
    if (this.currentMoveIndex < 0) {
      return false;
    }

    const move = this.moveHistory[this.currentMoveIndex];
    const { row, col } = move.position;
    const cellState = this.getCellState(row, col);

    if (move.moveType === 'pencil_mark') {
      // Restore previous pencil marks
      cellState.pencilMarks.clear();
      if (move.pencilMarks) {
        move.pencilMarks.forEach(mark => cellState.pencilMarks.add(mark));
      }
    } else {
      // Restore previous value
      this.grid[row][col] = move.previousValue;
      cellState.value = move.previousValue;
      
      if (move.moveType === 'clear' && move.pencilMarks) {
        // Restore pencil marks that were cleared
        cellState.pencilMarks.clear();
        move.pencilMarks.forEach(mark => cellState.pencilMarks.add(mark));
      }
    }

    this.currentMoveIndex--;
    return true;
  }

  /**
   * Redo the next move
   */
  redo(): boolean {
    if (this.currentMoveIndex >= this.moveHistory.length - 1) {
      return false;
    }

    this.currentMoveIndex++;
    const move = this.moveHistory[this.currentMoveIndex];
    const { row, col } = move.position;
    const cellState = this.getCellState(row, col);

    if (move.moveType === 'pencil_mark') {
      // Apply pencil mark change
      // const value = move.newValue; // This would need to be stored differently for pencil marks
      // For now, we'll reconstruct the pencil mark state
      // In a full implementation, we'd store the specific pencil mark change
    } else {
      // Apply the move
      this.grid[row][col] = move.newValue;
      cellState.value = move.newValue;
      
      if (move.moveType === 'clear') {
        cellState.pencilMarks.clear();
      } else if (move.newValue !== 0) {
        cellState.pencilMarks.clear();
      }
    }

    return true;
  }

  /**
   * Start the game timer
   */
  startTimer(): void {
    if (!this.timer.isRunning) {
      this.timer.startTime = new Date();
      this.timer.isRunning = true;
      this.timer.isPaused = false;
    }
  }

  /**
   * Pause the game timer
   */
  pauseTimer(): void {
    if (this.timer.isRunning && !this.timer.isPaused) {
      this.timer.isPaused = true;
      this.timer.lastPauseTime = new Date();
    }
  }

  /**
   * Resume the game timer
   */
  resumeTimer(): void {
    if (this.timer.isRunning && this.timer.isPaused && this.timer.lastPauseTime) {
      const pauseDuration = Date.now() - this.timer.lastPauseTime.getTime();
      this.timer.pausedTime += pauseDuration;
      this.timer.isPaused = false;
      this.timer.lastPauseTime = null;
    }
  }

  /**
   * Stop the game timer
   */
  stopTimer(): void {
    if (this.timer.isPaused && this.timer.lastPauseTime) {
      // Add final pause duration
      const pauseDuration = Date.now() - this.timer.lastPauseTime.getTime();
      this.timer.pausedTime += pauseDuration;
    }
    this.timer.isRunning = false;
    this.timer.isPaused = false;
    this.timer.lastPauseTime = null;
  }

  /**
   * Get elapsed time in milliseconds
   */
  getElapsedTime(): number {
    if (!this.timer.startTime) {
      return 0;
    }

    const now = Date.now();
    const startTime = this.timer.startTime.getTime();
    let totalElapsed = now - startTime;
    
    // Subtract total paused time
    totalElapsed -= this.timer.pausedTime;
    
    // If currently paused, subtract time since pause started
    if (this.timer.isPaused && this.timer.lastPauseTime) {
      const currentPauseDuration = now - this.timer.lastPauseTime.getTime();
      totalElapsed -= currentPauseDuration;
    }

    return Math.max(0, totalElapsed);
  }

  /**
   * Create a snapshot of the current game state
   */
  createSnapshot(): string {
    const snapshot: GameStateSnapshot = {
      id: this.generateMoveId(),
      grid: this.grid.map(row => [...row]),
      pencilMarks: new Map(),
      timer: { ...this.timer },
      moveHistory: [...this.moveHistory],
      currentMoveIndex: this.currentMoveIndex,
      timestamp: new Date(),
      score: this.score,
      mistakes: this.mistakes
    };

    // Copy pencil marks
    for (const [key, cellState] of this.cellStates) {
      if (cellState.pencilMarks.size > 0) {
        snapshot.pencilMarks.set(key, new Set(cellState.pencilMarks));
      }
    }

    // Maintain max snapshots
    if (this.snapshots.length >= this.maxSnapshots) {
      this.snapshots.shift();
    }

    this.snapshots.push(snapshot);
    return snapshot.id;
  }

  /**
   * Restore from a snapshot
   */
  restoreSnapshot(snapshotId: string): boolean {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return false;
    }

    this.grid = snapshot.grid.map(row => [...row]);
    this.timer = { ...snapshot.timer };
    this.moveHistory = [...snapshot.moveHistory];
    this.currentMoveIndex = snapshot.currentMoveIndex;

    // Restore cell states
    this.initializeCellStates();
    for (const [key, marks] of snapshot.pencilMarks) {
      const cellState = this.cellStates.get(key);
      if (cellState) {
        cellState.pencilMarks = new Set(marks);
      }
    }

    return true;
  }

  /**
   * Get the current grid state
   */
  getGrid(): number[][] {
    return this.grid.map(row => [...row]);
  }

  /**
   * Get cell state
   */
  getCellState(row: number, col: number): CellState {
    const key = this.getCellKey(row, col);
    const state = this.cellStates.get(key);
    if (!state) {
      throw new Error(`Invalid cell position: ${row}, ${col}`);
    }
    return state;
  }

  /**
   * Get all pencil marks for a cell
   */
  getPencilMarks(row: number, col: number): number[] {
    const cellState = this.getCellState(row, col);
    return Array.from(cellState.pencilMarks).sort();
  }

  /**
   * Check if the puzzle is complete
   */
  isComplete(): boolean {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.grid[row][col] === 0) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get move history
   */
  getMoveHistory(): GameMove[] {
    return [...this.moveHistory];
  }

  /**
   * Get current move index
   */
  getCurrentMoveIndex(): number {
    return this.currentMoveIndex;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.currentMoveIndex >= 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.currentMoveIndex < this.moveHistory.length - 1;
  }

  /**
   * Get timer state
   */
  getTimerState(): GameTimer {
    return { ...this.timer };
  }

  /**
   * Clear all pencil marks from a cell
   */
  clearPencilMarks(row: number, col: number): boolean {
    if (!this.isValidPosition(row, col)) {
      return false;
    }

    const cellState = this.getCellState(row, col);
    if (cellState.isGiven || cellState.pencilMarks.size === 0) {
      return false;
    }

    const previousMarks = Array.from(cellState.pencilMarks);
    cellState.pencilMarks.clear();

    // Create move for clearing pencil marks
    const move: GameMove = {
      id: this.generateMoveId(),
      position: { row, col },
      previousValue: 0,
      newValue: 0,
      timestamp: new Date(),
      moveType: 'clear',
      pencilMarks: previousMarks
    };

    this.moveHistory = this.moveHistory.slice(0, this.currentMoveIndex + 1);
    this.moveHistory.push(move);
    this.currentMoveIndex++;

    return true;
  }

  /**
   * Set cell highlighting
   */
  setCellHighlight(row: number, col: number, highlighted: boolean): void {
    if (this.isValidPosition(row, col)) {
      const cellState = this.getCellState(row, col);
      cellState.isHighlighted = highlighted;
    }
  }

  /**
   * Set cell selection
   */
  setCellSelection(row: number, col: number, selected: boolean): void {
    if (this.isValidPosition(row, col)) {
      const cellState = this.getCellState(row, col);
      cellState.isSelected = selected;
    }
  }

  /**
   * Set cell error state
   */
  setCellError(row: number, col: number, hasError: boolean): void {
    if (this.isValidPosition(row, col)) {
      const cellState = this.getCellState(row, col);
      cellState.hasError = hasError;
    }
  }

  // Private helper methods

  private getCellKey(row: number, col: number): string {
    return `${row},${col}`;
  }

  private isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  private generateMoveId(): string {
    return `move_${++this.moveIdCounter}_${Date.now()}`;
  }

  /**
   * Validate if a move is correct
   */
  private validateMove(row: number, col: number, value: number): boolean {
    // If we have the solution, check against it
    if (this.solutionGrid) {
      return this.solutionGrid[row][col] === value;
    }
    
    // Otherwise, check if the move violates Sudoku rules
    return this.isValidSudokuMove(row, col, value);
  }

  /**
   * Check if a move is valid according to Sudoku rules
   */
  private isValidSudokuMove(row: number, col: number, value: number): boolean {
    // Check row
    for (let c = 0; c < this.size; c++) {
      if (c !== col && this.grid[row][c] === value) {
        return false;
      }
    }

    // Check column
    for (let r = 0; r < this.size; r++) {
      if (r !== row && this.grid[r][col] === value) {
        return false;
      }
    }

    // Check 3x3 box
    const boxSize = Math.sqrt(this.size);
    const boxRow = Math.floor(row / boxSize) * boxSize;
    const boxCol = Math.floor(col / boxSize) * boxSize;

    for (let r = boxRow; r < boxRow + boxSize; r++) {
      for (let c = boxCol; c < boxCol + boxSize; c++) {
        if ((r !== row || c !== col) && this.grid[r][c] === value) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Calculate score for a move
   */
  private calculateMoveScore(_value: number): number {
    const baseScore = 10;
    const timeBonus = this.timer.isRunning ? Math.max(1, 5 - Math.floor(this.getElapsedTime() / 60000)) : 1;
    return baseScore * timeBonus;
  }

  /**
   * Get current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Get number of mistakes
   */
  getMistakes(): number {
    return this.mistakes;
  }

  /**
   * Get number of hints used
   */
  getHintsUsed(): number {
    return this.hintsUsed;
  }

  /**
   * Use a hint
   */
  useHint(row: number, col: number): boolean {
    if (!this.solutionGrid || !this.isValidPosition(row, col)) {
      return false;
    }

    const cellState = this.getCellState(row, col);
    if (cellState.isGiven || cellState.value !== 0) {
      return false;
    }

    const correctValue = this.solutionGrid[row][col];
    this.grid[row][col] = correctValue;
    cellState.value = correctValue;
    cellState.hasError = false;
    cellState.pencilMarks.clear();
    
    this.hintsUsed++;
    this.score = Math.max(0, this.score - 20); // Penalty for using hint

    return true;
  }

  /**
   * Set the solution grid for validation
   */
  setSolution(solutionGrid: number[][]): void {
    this.solutionGrid = solutionGrid.map(row => [...row]);
  }

  // private getLastPauseTime(): Date | null {
  //   // In a full implementation, we'd track when the pause started
  //   // For now, we'll use a simplified approach
  //   return this.timer.isPaused ? new Date() : null;
  // }
}