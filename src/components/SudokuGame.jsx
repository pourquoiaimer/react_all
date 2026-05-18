
import React, { useState, useEffect, useCallback } from 'react';
import './Sudoku.css';

// --- Constants ---
const difficulties = {
  4: { '入門': 4, '簡單': 6, '中等': 8, '困難': 10, '專家': 11 },
  9: { '入門': 32, '簡單': 38, '中等': 45, '困難': 52, '專家': 58 },
};

// --- Core Sudoku Logic (Remains Unchanged) ---
class SudokuSolver {
  constructor(size) {
    this.size = size;
    this.grid = Array(size).fill(0).map(() => Array(size).fill(0));
    this.blockSize = Math.sqrt(size);
  }
  isSafe(row, col, num) {
    for (let x = 0; x < this.size; x++) if (this.grid[row][x] === num) return false;
    for (let x = 0; x < this.size; x++) if (this.grid[x][col] === num) return false;
    const startRow = row - row % this.blockSize, startCol = col - col % this.blockSize;
    for (let i = 0; i < this.blockSize; i++) {
      for (let j = 0; j < this.blockSize; j++) {
        if (this.grid[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  }
  findEmpty() {
    for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) if (this.grid[i][j] === 0) return [i, j];
    return null;
  }
  solve() {
    const empty = this.findEmpty();
    if (!empty) return true;
    const [row, col] = empty;
    const numbers = this.getShuffledNumbers();
    for (const num of numbers) {
      if (this.isSafe(row, col, num)) {
        this.grid[row][col] = num;
        if (this.solve()) return true;
        this.grid[row][col] = 0;
      }
    }
    return false;
  }
  fillGrid() { this.solve(); return this.grid; }
  getShuffledNumbers() {
    const numbers = Array.from({length: this.size}, (_, i) => i + 1);
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  }
  pokeHoles(holes) {
    let removed = 0;
    while (removed < holes) {
      const row = Math.floor(Math.random() * this.size), col = Math.floor(Math.random() * this.size);
      if (this.grid[row][col] !== 0) { this.grid[row][col] = 0; removed++; }
    }
    return this.grid;
  }
  static generate(size, holes) {
    const solver = new SudokuSolver(size);
    solver.fillGrid();
    const solution = JSON.parse(JSON.stringify(solver.grid));
    const puzzle = solver.pokeHoles(holes);
    return { puzzle, solution };
  }
}

// --- React Component ---
const SudokuGame = () => {
  const [size, setSize] = useState(9);
  const [difficulty, setDifficulty] = useState('入門');
  const [board, setBoard] = useState(null);
  const [solution, setSolution] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [isNoteMode, setNoteMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setTimerActive] = useState(false);
  const [isCompleted, setCompleted] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalSettings, setModalSettings] = useState({ size: 9, difficulty: '入門' });

  const createInitialBoard = useCallback((puzzleGrid) => {
    return puzzleGrid.map((row, rIdx) =>
      row.map((cell, cIdx) => ({ row: rIdx, col: cIdx, value: cell, isGiven: cell !== 0, notes: [], isError: false }))
    );
  }, []);

  const startNewGame = useCallback((newSize, newDifficulty) => {
    setSize(newSize);
    setDifficulty(newDifficulty);
    const holes = difficulties[newSize][newDifficulty];
    const { puzzle, solution } = SudokuSolver.generate(newSize, holes);
    setBoard(createInitialBoard(puzzle));
    setSolution(solution);
    setTimer(0);
    setTimerActive(true);
    setCompleted(false);
    setSelectedCell({ row: null, col: null });
    setModalOpen(false);
  }, [createInitialBoard]);

  const handleOpenModal = () => {
    setModalSettings({ size, difficulty });
    setModalOpen(true);
  };
  
  const handleModalSettingChange = (setting, value) => {
      const newSettings = { ...modalSettings, [setting]: value };
      if (setting === 'size') {
          if (!difficulties[value][modalSettings.difficulty]) {
              newSettings.difficulty = '入門';
          }
      }
      setModalSettings(newSettings);
  }

  const handleKeyPress = useCallback((e) => {
    if (isModalOpen || !selectedCell.row === null || isCompleted) return;
    const { row, col } = selectedCell;
    if (row === null || col === null || !board) return;
    const currentCell = board[row][col];
    if (currentCell.isGiven) return;
    const newBoard = JSON.parse(JSON.stringify(board));
    const cellToUpdate = newBoard[row][col];

    if (e.key >= '1' && e.key <= '9') {
      const num = parseInt(e.key, 10);
      if (num > size) return;
      if (isNoteMode) {
        const noteIndex = cellToUpdate.notes.indexOf(num);
        if (noteIndex > -1) cellToUpdate.notes.splice(noteIndex, 1); else cellToUpdate.notes.push(num);
        cellToUpdate.notes.sort((a,b) => a-b);
        cellToUpdate.value = 0;
      } else {
        cellToUpdate.value = num;
        cellToUpdate.notes = [];
        cellToUpdate.isError = num !== solution[row][col];
      }
      setBoard(newBoard);
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      cellToUpdate.value = 0;
      cellToUpdate.notes = [];
      cellToUpdate.isError = false;
      setBoard(newBoard);
    }
  }, [board, selectedCell, isNoteMode, solution, isCompleted, size, isModalOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    let interval = null;
    if (isTimerActive) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  useEffect(() => {
    if (!board) return;
    const isBoardFull = board.every(row => row.every(cell => cell.value !== 0));
    if (isBoardFull) {
      const hasErrors = board.some(row => row.some(cell => cell.isError));
      if (!hasErrors) { setCompleted(true); setTimerActive(false); }
    }
  }, [board]);
  
  useEffect(() => {
      setModalOpen(true);
  }, []);

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="sudoku-container">
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>新遊戲設定</h2>
            <div className="control-group">
              <label>棋盤大小: </label>
              <select value={modalSettings.size} onChange={(e) => handleModalSettingChange('size', parseInt(e.target.value, 10))}>
                <option value={4}>4x4</option>
                <option value={9}>9x9</option>
              </select>
            </div>
            <div className="control-group">
              <label>難度: </label>
              <select value={modalSettings.difficulty} onChange={(e) => handleModalSettingChange('difficulty', e.target.value)}>
                {Object.keys(difficulties[modalSettings.size]).map(d => (
                    <option key={d} value={d}>
                        {`${d} (${difficulties[modalSettings.size][d]}個空格)`}
                    </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
                {board && <button onClick={() => setModalOpen(false)}>取消</button>}
                <button onClick={() => startNewGame(modalSettings.size, modalSettings.difficulty)} className="confirm">確認開始</button>
            </div>
          </div>
        </div>
      )}

      <h1>多功能數獨遊戲</h1>
      <div className="sudoku-controls">
         <div className="info-group">
            <span>棋盤: {size}x{size}</span>
            <span>難度: {difficulty}</span>
         </div>
         <button onClick={handleOpenModal}>新遊戲設定</button>
         <button onClick={() => setNoteMode(!isNoteMode)} className={isNoteMode ? 'active' : ''}>筆記模式</button>
         <span>計時: {formatTime(timer)}</span>
      </div>
      {isCompleted && <div className="completion-message">恭喜！您已完成數獨！</div>}
      {!board && <div className='start-prompt'>請點擊「新遊戲設定」開始一局遊戲。</div>}
      {board && (
        <div className={`sudoku-board size-${size}`}>
          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isSelected = selectedCell.row === rIdx && selectedCell.col === cIdx;
              const isHighlighted = selectedCell.row === rIdx || selectedCell.col === cIdx;
              return (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  data-row={rIdx}
                  data-col={cIdx}
                  className={`sudoku-cell ${cell.isGiven ? 'given' : ''} ${isSelected ? 'selected' : ''} ${isHighlighted && !isSelected ? 'highlighted' : ''} ${cell.isError ? 'error' : ''}`}
                  onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                >
                  {cell.value !== 0 ? cell.value : (
                      <div className="sudoku-notes">
                          {cell.notes.map(note => <div key={note} className="sudoku-note">{note}</div>)}
                      </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  );
};

export default SudokuGame;
