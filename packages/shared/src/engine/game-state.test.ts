/**
 * Unit tests for game state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameState } from './game-state.js';

describe('GameState', () => {
  let gameState: GameState;
  let initialGrid: number[][];

  beforeEach(() => {
    initialGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    gameState = new GameState(initialGrid);
  });

  describe('initialization', () => {
    it('should initialize with the provided grid', () => {
      const grid = gameState.getGrid();
      expect(grid).toEqual(initialGrid);
    });

    it('should mark given cells correctly', () => {
      const cellState = gameState.getCellState(0, 0); // Cell with value 5
      expect(cellState.isGiven).toBe(true);
      expect(cellState.value).toBe(5);

      const emptyCellState = gameState.getCellState(0, 2); // Empty cell
      expect(emptyCellState.isGiven).toBe(false);
      expect(emptyCellState.value).toBe(0);
    });

    it('should initialize timer as not running', () => {
      const timer = gameState.getTimerState();
      expect(timer.isRunning).toBe(false);
      expect(timer.isPaused).toBe(false);
      expect(timer.startTime).toBeNull();
    });

    it('should initialize with empty move history', () => {
      expect(gameState.getMoveHistory()).toHaveLength(0);
      expect(gameState.getCurrentMoveIndex()).toBe(-1);
      expect(gameState.canUndo()).toBe(false);
      expect(gameState.canRedo()).toBe(false);
    });
  });

  describe('makeMove', () => {
    it('should make a valid move on empty cell', () => {
      const success = gameState.makeMove(0, 2, 4);
      expect(success).toBe(true);

      const grid = gameState.getGrid();
      expect(grid[0][2]).toBe(4);

      const cellState = gameState.getCellState(0, 2);
      expect(cellState.value).toBe(4);
      expect(cellState.pencilMarks.size).toBe(0);
    });

    it('should not allow moves on given cells', () => {
      const success = gameState.makeMove(0, 0, 9); // Try to change given cell
      expect(success).toBe(false);

      const grid = gameState.getGrid();
      expect(grid[0][0]).toBe(5); // Should remain unchanged
    });

    it('should start timer on first move', () => {
      gameState.makeMove(0, 2, 4);
      const timer = gameState.getTimerState();
      expect(timer.isRunning).toBe(true);
      expect(timer.startTime).not.toBeNull();
    });

    it('should add move to history', () => {
      gameState.makeMove(0, 2, 4);
      
      const history = gameState.getMoveHistory();
      expect(history).toHaveLength(1);
      expect(history[0].position).toEqual({ row: 0, col: 2 });
      expect(history[0].previousValue).toBe(0);
      expect(history[0].newValue).toBe(4);
      expect(history[0].moveType).toBe('value');
    });

    it('should clear pencil marks when placing value', () => {
      // First add some pencil marks
      gameState.togglePencilMark(0, 2, 1);
      gameState.togglePencilMark(0, 2, 2);
      
      let cellState = gameState.getCellState(0, 2);
      expect(cellState.pencilMarks.size).toBe(2);

      // Then place a value
      gameState.makeMove(0, 2, 4);
      
      cellState = gameState.getCellState(0, 2);
      expect(cellState.pencilMarks.size).toBe(0);
    });

    it('should handle clear moves', () => {
      // First place a value
      gameState.makeMove(0, 2, 4);
      expect(gameState.getGrid()[0][2]).toBe(4);

      // Then clear it
      const success = gameState.makeMove(0, 2, 0, 'clear');
      expect(success).toBe(true);
      expect(gameState.getGrid()[0][2]).toBe(0);

      const history = gameState.getMoveHistory();
      expect(history).toHaveLength(2);
      expect(history[1].moveType).toBe('clear');
    });

    it('should reject invalid positions', () => {
      const success = gameState.makeMove(-1, 0, 4);
      expect(success).toBe(false);

      const success2 = gameState.makeMove(0, 10, 4);
      expect(success2).toBe(false);
    });

    it('should not create move for same value', () => {
      gameState.makeMove(0, 2, 4);
      const historyLength = gameState.getMoveHistory().length;

      const success = gameState.makeMove(0, 2, 4); // Same value
      expect(success).toBe(false);
      expect(gameState.getMoveHistory()).toHaveLength(historyLength);
    });
  });

  describe('pencil marks', () => {
    it('should toggle pencil marks correctly', () => {
      const success = gameState.togglePencilMark(0, 2, 1);
      expect(success).toBe(true);

      const marks = gameState.getPencilMarks(0, 2);
      expect(marks).toEqual([1]);

      // Toggle again to remove
      gameState.togglePencilMark(0, 2, 1);
      const marksAfter = gameState.getPencilMarks(0, 2);
      expect(marksAfter).toEqual([]);
    });

    it('should handle multiple pencil marks', () => {
      gameState.togglePencilMark(0, 2, 1);
      gameState.togglePencilMark(0, 2, 2);
      gameState.togglePencilMark(0, 2, 3);

      const marks = gameState.getPencilMarks(0, 2);
      expect(marks).toEqual([1, 2, 3]);
    });

    it('should not allow pencil marks on given cells', () => {
      const success = gameState.togglePencilMark(0, 0, 1); // Given cell
      expect(success).toBe(false);
    });

    it('should not allow pencil marks on cells with values', () => {
      gameState.makeMove(0, 2, 4);
      const success = gameState.togglePencilMark(0, 2, 1);
      expect(success).toBe(false);
    });

    it('should reject invalid pencil mark values', () => {
      const success1 = gameState.togglePencilMark(0, 2, 0);
      expect(success1).toBe(false);

      const success2 = gameState.togglePencilMark(0, 2, 10);
      expect(success2).toBe(false);
    });

    it('should clear pencil marks', () => {
      gameState.togglePencilMark(0, 2, 1);
      gameState.togglePencilMark(0, 2, 2);
      
      const success = gameState.clearPencilMarks(0, 2);
      expect(success).toBe(true);

      const marks = gameState.getPencilMarks(0, 2);
      expect(marks).toEqual([]);
    });

    it('should add pencil mark moves to history', () => {
      gameState.togglePencilMark(0, 2, 1);
      
      const history = gameState.getMoveHistory();
      expect(history).toHaveLength(1);
      expect(history[0].moveType).toBe('pencil_mark');
    });
  });

  describe('undo/redo', () => {
    it('should undo value moves', () => {
      gameState.makeMove(0, 2, 4);
      expect(gameState.getGrid()[0][2]).toBe(4);

      const success = gameState.undo();
      expect(success).toBe(true);
      expect(gameState.getGrid()[0][2]).toBe(0);
      expect(gameState.getCurrentMoveIndex()).toBe(-1);
    });

    it('should redo value moves', () => {
      gameState.makeMove(0, 2, 4);
      gameState.undo();
      
      const success = gameState.redo();
      expect(success).toBe(true);
      expect(gameState.getGrid()[0][2]).toBe(4);
      expect(gameState.getCurrentMoveIndex()).toBe(0);
    });

    it('should undo pencil mark moves', () => {
      gameState.togglePencilMark(0, 2, 1);
      expect(gameState.getPencilMarks(0, 2)).toEqual([1]);

      gameState.undo();
      expect(gameState.getPencilMarks(0, 2)).toEqual([]);
    });

    it('should handle multiple undo/redo operations', () => {
      gameState.makeMove(0, 2, 4);
      gameState.makeMove(0, 3, 2);
      gameState.makeMove(1, 1, 7);

      expect(gameState.canUndo()).toBe(true);
      expect(gameState.canRedo()).toBe(false);

      // Undo all moves
      gameState.undo();
      gameState.undo();
      gameState.undo();

      expect(gameState.canUndo()).toBe(false);
      expect(gameState.canRedo()).toBe(true);

      const grid = gameState.getGrid();
      expect(grid[0][2]).toBe(0);
      expect(grid[0][3]).toBe(0);
      expect(grid[1][1]).toBe(0);

      // Redo all moves
      gameState.redo();
      gameState.redo();
      gameState.redo();

      expect(gameState.canUndo()).toBe(true);
      expect(gameState.canRedo()).toBe(false);

      const gridAfterRedo = gameState.getGrid();
      expect(gridAfterRedo[0][2]).toBe(4);
      expect(gridAfterRedo[0][3]).toBe(2);
      expect(gridAfterRedo[1][1]).toBe(7);
    });

    it('should clear redo history when making new moves', () => {
      gameState.makeMove(0, 2, 4);
      gameState.makeMove(0, 3, 2);
      gameState.undo();

      expect(gameState.canRedo()).toBe(true);

      // Make a new move, should clear redo history
      gameState.makeMove(0, 3, 3);

      expect(gameState.canRedo()).toBe(false);
      expect(gameState.getGrid()[0][3]).toBe(3);
    });

    it('should return false when no moves to undo/redo', () => {
      expect(gameState.undo()).toBe(false);
      expect(gameState.redo()).toBe(false);
    });
  });

  describe('timer functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start timer manually', () => {
      gameState.startTimer();
      const timer = gameState.getTimerState();
      expect(timer.isRunning).toBe(true);
      expect(timer.isPaused).toBe(false);
    });

    it('should pause and resume timer', () => {
      gameState.startTimer();
      
      vi.advanceTimersByTime(1000);
      gameState.pauseTimer();
      
      let timer = gameState.getTimerState();
      expect(timer.isPaused).toBe(true);
      expect(timer.isRunning).toBe(true);

      gameState.resumeTimer();
      timer = gameState.getTimerState(); // Get fresh state
      expect(timer.isPaused).toBe(false);
    });

    it('should stop timer', () => {
      gameState.startTimer();
      gameState.stopTimer();
      
      const timer = gameState.getTimerState();
      expect(timer.isRunning).toBe(false);
      expect(timer.isPaused).toBe(false);
    });

    it('should calculate elapsed time', () => {
      gameState.startTimer();
      vi.advanceTimersByTime(5000);
      
      const elapsed = gameState.getElapsedTime();
      expect(elapsed).toBeGreaterThan(4000);
      expect(elapsed).toBeLessThan(6000);
    });

    it('should handle paused time correctly', () => {
      gameState.startTimer();
      vi.advanceTimersByTime(2000);
      
      gameState.pauseTimer();
      vi.advanceTimersByTime(3000); // This time should not count
      
      gameState.resumeTimer();
      vi.advanceTimersByTime(1000);
      
      const elapsed = gameState.getElapsedTime();
      expect(elapsed).toBeGreaterThan(2500);
      expect(elapsed).toBeLessThan(3500);
    });
  });

  describe('snapshots', () => {
    it('should create and restore snapshots', () => {
      gameState.makeMove(0, 2, 4);
      gameState.togglePencilMark(0, 3, 1);
      
      const snapshotId = gameState.createSnapshot();
      expect(snapshotId).toBeDefined();

      // Make more changes
      gameState.makeMove(0, 3, 2);
      gameState.makeMove(1, 1, 7);

      // Restore snapshot
      const success = gameState.restoreSnapshot(snapshotId);
      expect(success).toBe(true);

      const grid = gameState.getGrid();
      expect(grid[0][2]).toBe(4);
      expect(grid[0][3]).toBe(0);
      expect(grid[1][1]).toBe(0);

      const marks = gameState.getPencilMarks(0, 3);
      expect(marks).toEqual([1]);
    });

    it('should return false for invalid snapshot ID', () => {
      const success = gameState.restoreSnapshot('invalid-id');
      expect(success).toBe(false);
    });
  });

  describe('cell state management', () => {
    it('should set cell highlighting', () => {
      gameState.setCellHighlight(0, 2, true);
      const cellState = gameState.getCellState(0, 2);
      expect(cellState.isHighlighted).toBe(true);

      gameState.setCellHighlight(0, 2, false);
      expect(cellState.isHighlighted).toBe(false);
    });

    it('should set cell selection', () => {
      gameState.setCellSelection(0, 2, true);
      const cellState = gameState.getCellState(0, 2);
      expect(cellState.isSelected).toBe(true);
    });

    it('should set cell error state', () => {
      gameState.setCellError(0, 2, true);
      const cellState = gameState.getCellState(0, 2);
      expect(cellState.hasError).toBe(true);
    });

    it('should handle invalid positions gracefully', () => {
      expect(() => gameState.setCellHighlight(-1, 0, true)).not.toThrow();
      expect(() => gameState.setCellSelection(10, 0, true)).not.toThrow();
      expect(() => gameState.setCellError(0, -1, true)).not.toThrow();
    });
  });

  describe('game completion', () => {
    it('should detect incomplete puzzle', () => {
      expect(gameState.isComplete()).toBe(false);
    });

    it('should detect complete puzzle', () => {
      // Fill in all empty cells
      const completeGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

      // Make moves to complete the puzzle
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (initialGrid[row][col] === 0) {
            gameState.makeMove(row, col, completeGrid[row][col]);
          }
        }
      }

      expect(gameState.isComplete()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid cell state access', () => {
      expect(() => gameState.getCellState(-1, 0)).toThrow();
      expect(() => gameState.getCellState(0, 10)).toThrow();
    });

    it('should handle edge cases gracefully', () => {
      // Test with empty initial grid
      const emptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      const emptyGameState = new GameState(emptyGrid);
      
      expect(emptyGameState.isComplete()).toBe(false);
      expect(emptyGameState.makeMove(0, 0, 1)).toBe(true);
    });
  });

  describe('move history integrity', () => {
    it('should maintain move history consistency', () => {
      gameState.makeMove(0, 2, 4);
      gameState.makeMove(0, 3, 2);
      gameState.togglePencilMark(1, 1, 5);
      
      const history = gameState.getMoveHistory();
      expect(history).toHaveLength(3);
      
      // Check move IDs are unique
      const ids = history.map(move => move.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      
      // Check timestamps are in order
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          history[i - 1].timestamp.getTime()
        );
      }
    });

    it('should handle rapid moves correctly', () => {
      // Make many moves quickly
      for (let i = 0; i < 10; i++) {
        gameState.makeMove(0, 2, (i % 9) + 1);
      }
      
      const history = gameState.getMoveHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(gameState.getCurrentMoveIndex()).toBe(history.length - 1);
    });
  });
});