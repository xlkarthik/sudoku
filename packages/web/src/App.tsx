import { useState, useEffect, useCallback } from 'react';
import { 
  PuzzleGenerator, 
  GameState, 
  PuzzleSolver 
} from '../../shared/src/engine/index.js';
import { 
  PuzzleVariant, 
  Difficulty, 
  PuzzleSize 
} from '../../shared/src/types/puzzle.js';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pencilMode, setPencilMode] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [, setTick] = useState(0);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState) {
        setElapsedTime(gameState.getElapsedTime());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateNewPuzzle = useCallback(async (difficulty: Difficulty = Difficulty.MEDIUM) => {
    setIsGenerating(true);
    try {
      const generator = new PuzzleGenerator();
      const puzzle = await generator.generatePuzzle({
        variant: PuzzleVariant.CLASSIC,
        difficulty,
        size: PuzzleSize.CLASSIC_9X9
      });
      
      const newGameState = new GameState(puzzle.initialState, puzzle.solution);
      setGameState(newGameState);
      setSelectedCell(null);
      setCurrentDifficulty(difficulty);
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const selectCell = useCallback((row: number, col: number) => {
    if (!gameState) return;
    // Clear previous selection
    if (selectedCell) {
      gameState.setCellSelection(selectedCell.row, selectedCell.col, false);
    }
    setSelectedCell({ row, col });
    gameState.setCellSelection(row, col, true);
    setTick(t => t + 1);
  }, [gameState, selectedCell]);

  const findFirstEditable = useCallback((): { row: number, col: number } | null => {
    if (!gameState) return null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const s = gameState.getCellState(r, c);
        if (!s.isGiven) return { row: r, col: c };
      }
    }
    return null;
  }, [gameState]);

  const moveSelection = useCallback((dr: number, dc: number) => {
    if (!gameState) return;
    let current = selectedCell ?? findFirstEditable();
    if (!current) return;
    let r = current.row;
    let c = current.col;
    for (let attempts = 0; attempts < 81; attempts++) {
      r = (r + dr + 9) % 9;
      c = (c + dc + 9) % 9;
      const state = gameState.getCellState(r, c);
      if (!state.isGiven) {
        selectCell(r, c);
        return;
      }
    }
  }, [gameState, selectedCell, selectCell, findFirstEditable]);

  // Global keyboard controls (after generateNewPuzzle is defined)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!gameState) return;
      if (e.key >= '1' && e.key <= '9') {
        // Auto-select first editable cell if none selected
        if (!selectedCell) {
          const first = findFirstEditable();
          if (first) selectCell(first.row, first.col);
        }
        handleNumberInput(Number(e.key));
        e.preventDefault();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        moveSelection(-1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        moveSelection(1, 0);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        moveSelection(0, -1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        moveSelection(0, 1);
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'p') {
        setPencilMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'h') {
        handleHint();
      } else if (e.key.toLowerCase() === 'u') {
        handleUndo();
      } else if (e.key.toLowerCase() === 'r') {
        handleRedo();
      } else if (e.key.toLowerCase() === 'n') {
        generateNewPuzzle(currentDifficulty);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, selectedCell, pencilMode, currentDifficulty, generateNewPuzzle, moveSelection, findFirstEditable, selectCell]);

  const solvePuzzle = useCallback(async () => {
    if (!gameState) return;
    
    const solver = new PuzzleSolver();
    const puzzle = {
      initialState: gameState.getGrid(),
      // Mock puzzle object for solver
      id: 'test',
      variant: PuzzleVariant.CLASSIC,
      difficulty: currentDifficulty,
      size: PuzzleSize.CLASSIC_9X9,
      solution: [],
      constraints: [],
      metadata: {
        estimatedSolveTime: 0,
        techniques: [],
        rating: 0,
        playCount: 0,
        averageSolveTime: 0
      },
      createdAt: new Date(),
      difficultyScore: 0
    };
    
    const result = solver.solvePuzzle(puzzle);
    if (result.solved && result.solution) {
      // Apply solution to game state
      const currentGrid = gameState.getGrid();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (currentGrid[row][col] === 0) {
            gameState.makeMove(row, col, result.solution[row][col]);
          }
        }
      }
      setTick(t => t + 1);
    }
  }, [gameState, currentDifficulty]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState) return;
    
    const cellState = gameState.getCellState(row, col);
    if (cellState.isGiven) return; // Can't select given cells
    
    // Clear previous selection
    if (selectedCell) {
      gameState.setCellSelection(selectedCell.row, selectedCell.col, false);
    }
    
    // Set new selection
    setSelectedCell({ row, col });
    gameState.setCellSelection(row, col, true);
    setTick(t => t + 1); // Force re-render without recreating GameState
  };

  const handleNumberInput = (number: number) => {
    if (!gameState || !selectedCell) return;
    
    if (pencilMode) {
      gameState.togglePencilMark(selectedCell.row, selectedCell.col, number);
    } else {
      gameState.makeMove(selectedCell.row, selectedCell.col, number);
    }
    
    setTick(t => t + 1); // Force re-render
  };

  const handleClear = () => {
    if (!gameState || !selectedCell) return;
    
    gameState.makeMove(selectedCell.row, selectedCell.col, 0, 'clear');
    setTick(t => t + 1);
  };

  const handleUndo = () => {
    if (!gameState) return;
    
    gameState.undo();
    setTick(t => t + 1);
  };

  const handleRedo = () => {
    if (!gameState) return;
    
    gameState.redo();
    setTick(t => t + 1);
  };

  const handleHint = () => {
    if (!gameState || !selectedCell) return;
    
    const success = gameState.useHint(selectedCell.row, selectedCell.col);
    if (success) {
      setTick(t => t + 1);
    }
  };

  const renderCell = (row: number, col: number) => {
    if (!gameState) return null;
    
    const cellState = gameState.getCellState(row, col);
    const pencilMarks = gameState.getPencilMarks(row, col);

    let className = 'sudoku-cell';
    if (cellState.isGiven) className += ' given';
    if (cellState.isSelected) className += ' selected';
    if (cellState.hasError) className += ' error';

    // Enhanced highlights: row/col/box peers and same-number
    if (selectedCell) {
      const inSameRow = selectedCell.row === row;
      const inSameCol = selectedCell.col === col;
      const boxSize = 3;
      const inSameBox = Math.floor(selectedCell.row / boxSize) === Math.floor(row / boxSize)
        && Math.floor(selectedCell.col / boxSize) === Math.floor(col / boxSize);
      if ((inSameRow || inSameCol) && !cellState.isSelected) className += ' peer';
      if (inSameBox && !cellState.isSelected) className += ' peer-box';

      const selectedValue = gameState.getCellState(selectedCell.row, selectedCell.col).value;
      if (selectedValue !== 0 && cellState.value === selectedValue && !cellState.isSelected) {
        className += ' same-value';
      }
    }

    return (
      <div
        key={`${row}-${col}`}
        className={className}
        onClick={() => handleCellClick(row, col)}
        data-row={row}
        data-col={col}
      >
        {cellState.value !== 0 ? (
          cellState.value
        ) : pencilMarks.length > 0 ? (
          <div className="pencil-marks">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <div key={num} className="pencil-mark">
                {pencilMarks.includes(num) ? num : ''}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  // Initialize with a puzzle on first load
  useEffect(() => {
    generateNewPuzzle(Difficulty.MEDIUM);
  }, [generateNewPuzzle]);

  const countClues = (grid: number[][]): number => {
    let count = 0;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] !== 0) {
          count++;
        }
      }
    }
    return count;
  };

  return (
    <div className="App">
      <div className="top-bar">
        <div className="difficulty-chips">
          {[
            Difficulty.BEGINNER,
            Difficulty.EASY,
            Difficulty.MEDIUM,
            Difficulty.HARD,
            Difficulty.EXPERT
          ].map(diff => (
            <button
              key={diff}
              className={`chip ${currentDifficulty === diff ? 'active' : ''}`}
              onClick={() => generateNewPuzzle(diff)}
              disabled={isGenerating}
            >
              {diff}
            </button>
          ))}
        </div>
        <div className="stats">
          <span>Time: <strong>{formatTime(elapsedTime)}</strong></span>
          <span>Mode: <strong>{pencilMode ? 'Pencil' : 'Number'}</strong></span>
          {gameState && (
            <>
              <span>Score: <strong>{gameState.getScore()}</strong></span>
              <span>Mistakes: <strong>{gameState.getMistakes()}/3</strong></span>
              <span>Clues: <strong>{countClues(gameState.getGrid())}/81</strong></span>
            </>
          )}
        </div>
      </div>

      <div className="content">
        {gameState && (
          <div className="board">
            <div className="sudoku-container">
              <div className="sudoku-grid">
                {Array.from({ length: 9 }, (_, row) =>
                  Array.from({ length: 9 }, (_, col) => renderCell(row, col))
                )}
              </div>
            </div>
          </div>
        )}
        <div className="side-panel">
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                className="number-btn"
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell}
              >
                {num}
              </button>
            ))}
            <button
              className="number-btn clear"
              onClick={handleClear}
              disabled={!selectedCell}
            >
              Clear
            </button>
          </div>
          <div className="actions">
            <button className="btn secondary" onClick={handleUndo} disabled={!gameState?.canUndo()}>Undo</button>
            <button className="btn secondary" onClick={handleRedo} disabled={!gameState?.canRedo()}>Redo</button>
            <button className={`btn ${pencilMode ? 'danger' : 'secondary'}`} onClick={() => setPencilMode(!pencilMode)}>
              {pencilMode ? 'Exit Pencil (P)' : 'Pencil Mode (P)'}
            </button>
            <button className="btn secondary" onClick={handleHint} disabled={!gameState || !selectedCell}>Hint (-20)</button>
            <button className="btn danger" onClick={solvePuzzle} disabled={!gameState}>Solve</button>
          </div>
        </div>
      </div>

      {gameState?.isComplete() && (
        <div className="completion-message">🎉 Puzzle Completed! 🎉</div>
      )}
    </div>
  );
}

export default App;