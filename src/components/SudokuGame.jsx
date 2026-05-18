
import React, { useState, useEffect, useCallback } from 'react';
import './Sudoku.css';

// --- Constants ---
const SUDOKU_SAVE_KEY = 'sudokuGameState';
const difficulties = {
  4: { '入門': 4, '簡單': 6, '中等': 8, '困難': 10, '專家': 11 },
  9: { '入門': 32, '簡單': 38, '中等': 45, '困難': 52, '專家': 58 },
};

// --- Core Sudoku Logic (Unchanged) ---
class SudokuSolver { constructor(size) { this.size = size; this.grid = Array(size).fill(0).map(() => Array(size).fill(0)); this.blockSize = Math.sqrt(size); } isSafe(row, col, num) { for (let x = 0; x < this.size; x++) { if (this.grid[row][x] === num || this.grid[x][col] === num) return false; } const sR = row - row % this.blockSize, sC = col - col % this.blockSize; for (let i = 0; i < this.blockSize; i++) for (let j = 0; j < this.blockSize; j++) if (this.grid[i + sR][j + sC] === num) return false; return true; } findEmpty() { for (let i = 0; i < this.size; i++) for (let j = 0; j < this.size; j++) if (this.grid[i][j] === 0) return [i, j]; return null; } solve() { const empty = this.findEmpty(); if (!empty) return true; const [row, col] = empty; const numbers = this.getShuffledNumbers(); for (const num of numbers) { if (this.isSafe(row, col, num)) { this.grid[row][col] = num; if (this.solve()) return true; this.grid[row][col] = 0; } } return false; } fillGrid() { this.solve(); return this.grid; } getShuffledNumbers() { const numbers = Array.from({length: this.size}, (_, i) => i + 1); for (let i = numbers.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [numbers[i], numbers[j]] = [numbers[j], numbers[i]]; } return numbers; } pokeHoles(holes) { let removed = 0; while (removed < holes) { const r = Math.floor(Math.random() * this.size), c = Math.floor(Math.random() * this.size); if (this.grid[r][c] !== 0) { this.grid[r][c] = 0; removed++; } } return this.grid; } static generate(size, holes) { const solver = new SudokuSolver(size); solver.fillGrid(); const puzzle = solver.pokeHoles(holes); return { puzzle }; } }


// --- React Component ---
const SudokuGame = () => {
  const [size, setSize] = useState(9);
  const [difficulty, setDifficulty] = useState('入門');
  const [board, setBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });
  const [highlightedNumber, setHighlightedNumber] = useState(null);
  const [isNoteMode, setNoteMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setTimerActive] = useState(false);
  const [isCompleted, setCompleted] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCompletionModalOpen, setCompletionModalOpen] = useState(false);
  const [modalSettings, setModalSettings] = useState({ size: 9, difficulty: '入門' });
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const validateBoard = useCallback((boardToValidate) => {
    const newBoard = JSON.parse(JSON.stringify(boardToValidate));
    const size = newBoard.length; const blockSize = Math.sqrt(size);
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!newBoard[r][c].isGiven) newBoard[r][c].isError = false;
    const findConflictsInGroup = (group) => {
        const seen = {};
        group.forEach(cell => { if (cell.value !== 0) { if (!seen[cell.value]) seen[cell.value] = []; seen[cell.value].push(cell); } });
        for (const num in seen) { if (seen[num].length > 1) { seen[num].forEach(c => { if (!newBoard[c.row][c.col].isGiven) newBoard[c.row][c.col].isError = true; }); } }
    };
    for (let i = 0; i < size; i++) { findConflictsInGroup(newBoard[i]); findConflictsInGroup(newBoard.map(row => row[i])); }
    for (let br = 0; br < blockSize; br++) for (let bc = 0; bc < blockSize; bc++) { const block = []; const sR = br * blockSize, sC = bc * blockSize; for (let r = 0; r < blockSize; r++) for (let c = 0; c < blockSize; c++) block.push(newBoard[sR + r][sC + c]); findConflictsInGroup(block); }
    return newBoard;
  }, []);

  const createInitialBoard = useCallback((puzzleGrid) => puzzleGrid.map((row, rIdx) => row.map((cell, cIdx) => ({ row: rIdx, col: cIdx, value: cell, isGiven: cell !== 0, notes: [], isError: false }))), []);

  const startNewGame = useCallback((newSize, newDifficulty) => {
    setSize(newSize); setDifficulty(newDifficulty);
    const holes = difficulties[newSize][newDifficulty];
    const { puzzle } = SudokuSolver.generate(newSize, holes);
    setBoard(createInitialBoard(puzzle));
    setTimer(0); setTimerActive(true); setCompleted(false); setSelectedCell({ row: null, col: null }); setHighlightedNumber(null); setModalOpen(false); setCompletionModalOpen(false);
  }, [createInitialBoard]);

  const handleLoadGame = useCallback(() => {
    const savedStateJSON = localStorage.getItem(SUDOKU_SAVE_KEY);
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      setBoard(savedState.board);
      setSize(savedState.size);
      setDifficulty(savedState.difficulty);
      setTimer(savedState.timer);
      setTimerActive(true);
      setCompleted(false);
      setModalOpen(false);
      setHighlightedNumber(null);
      setSelectedCell({ row: null, col: null });
    }
  }, []);

  useEffect(() => {
    const savedStateJSON = localStorage.getItem(SUDOKU_SAVE_KEY);
    setHasSavedGame(!!savedStateJSON);
    setModalOpen(true);
  }, []);

  useEffect(() => {
    if (board && !isCompleted) {
      const gameState = { board, size, difficulty, timer };
      localStorage.setItem(SUDOKU_SAVE_KEY, JSON.stringify(gameState));
      setHasSavedGame(true);
    }
  }, [board, size, difficulty, timer, isCompleted]);

  useEffect(() => {
    if (!board || isCompleted) return;
    const isFull = board.every(r => r.every(c => c.value !== 0));
    if (isFull) {
      const hasErrors = board.some(r => r.some(c => c.isError));
      if (!hasErrors) {
        setCompleted(true); setTimerActive(false); setCompletionModalOpen(true);
        localStorage.removeItem(SUDOKU_SAVE_KEY);
        setHasSavedGame(false);
      }
    }
  }, [board, isCompleted]);

  const handleOpenModal = () => { setModalSettings({ size, difficulty }); setModalOpen(true); };
  const handleModalSettingChange = (setting, value) => { const newSettings = { ...modalSettings, [setting]: value }; if (setting === 'size' && !difficulties[value][modalSettings.difficulty]) newSettings.difficulty = '入門'; setModalSettings(newSettings); }
  const handleCellClick = (row, col) => { setSelectedCell({ row, col }); const cellValue = board && board[row][col].value; setHighlightedNumber(cellValue || null); };
  const handleValueInput = useCallback((num) => { if (isCompleted || selectedCell.row === null || !board) return; const { row, col } = selectedCell; if (board[row][col].isGiven) return; const newBoard = JSON.parse(JSON.stringify(board)); const cellToUpdate = newBoard[row][col]; if (isNoteMode) { cellToUpdate.value = 0; const noteIndex = cellToUpdate.notes.indexOf(num); if (noteIndex > -1) cellToUpdate.notes.splice(noteIndex, 1); else { cellToUpdate.notes.push(num); cellToUpdate.notes.sort((a,b) => a-b); } } else { cellToUpdate.value = num; cellToUpdate.notes = []; } setBoard(validateBoard(newBoard)); setHighlightedNumber(num); }, [board, selectedCell, isNoteMode, isCompleted, validateBoard]);
  const handleDelete = useCallback(() => { if (isCompleted || selectedCell.row === null || !board) return; const { row, col } = selectedCell; if (board[row][col].isGiven) return; const newBoard = JSON.parse(JSON.stringify(board)); newBoard[row][col].value = 0; newBoard[row][col].notes = []; setBoard(validateBoard(newBoard)); setHighlightedNumber(null); }, [board, selectedCell, isCompleted, validateBoard]);
  const handleKeyPress = useCallback((e) => { if (isModalOpen || isCompletionModalOpen || isCompleted) return; const num = parseInt(e.key, 10); if (num >= 1 && num <= size) handleValueInput(num); else if (e.key === 'Backspace' || e.key === 'Delete') handleDelete(); }, [isModalOpen, isCompletionModalOpen, isCompleted, size, handleValueInput, handleDelete]);
  useEffect(() => { window.addEventListener('keydown', handleKeyPress); return () => window.removeEventListener('keydown', handleKeyPress); }, [handleKeyPress]);
  useEffect(() => { let i = null; if (isTimerActive) i = setInterval(() => setTimer(t => t + 1), 1000); return () => clearInterval(i); }, [isTimerActive]);
  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="sudoku-container">
      {isModalOpen && (
        <div className="modal-overlay"><div className="modal-content"><h2>新遊戲設定</h2><div className="control-group"><label>棋盤大小: </label><select value={modalSettings.size} onChange={(e) => handleModalSettingChange('size', parseInt(e.target.value, 10))}><option value={4}>4x4</option><option value={9}>9x9</option></select></div><div className="control-group"><label>難度: </label><select value={modalSettings.difficulty} onChange={(e) => handleModalSettingChange('difficulty', e.target.value)}>{Object.keys(difficulties[modalSettings.size]).map(d => (<option key={d} value={d}>{`${d} (${difficulties[modalSettings.size][d]}個空格)`}</option>))}</select></div><div className="control-group"><label>遊戲紀錄:</label><button onClick={handleLoadGame} disabled={!hasSavedGame}>讀取進度</button></div><div className="modal-actions"><button onClick={() => board && setModalOpen(false)} disabled={!board}>取消</button><button onClick={() => startNewGame(modalSettings.size, modalSettings.difficulty)} className="confirm">確認開始</button></div></div></div>
      )}
      {isCompletionModalOpen && (
        <div className="modal-overlay"><div className="modal-content"><h2>恭喜！您已完成！</h2><div className="completion-details"><span>難度: {difficulty}</span><span>所用時間: {formatTime(timer)}</span></div><div className="modal-actions"><button onClick={() => setCompletionModalOpen(false)}>檢視盤面</button><button onClick={() => { setCompletionModalOpen(false); handleOpenModal(); }} className="confirm">開始新遊戲</button></div></div></div>
      )}
      <h1>多功能數獨遊戲</h1>
      <div className="sudoku-controls"><div className="info-group"><span>棋盤: {size}x{size}</span><span>難度: {difficulty}</span></div><button onClick={handleOpenModal}>新遊戲設定</button><button onClick={() => setNoteMode(!isNoteMode)} className={isNoteMode ? 'active' : ''}>筆記模式</button><span>計時: {formatTime(timer)}</span></div>
      {!board && <div className='start-prompt'>請點擊「新遊戲設定」開始一局遊戲。</div>}
      <div className="sudoku-main-area">
          {board && <div className={`sudoku-board size-${size}`}>{board.map((row, rIdx) => row.map((cell, cIdx) => { const isSelected = selectedCell.row === rIdx && selectedCell.col === cIdx; const isCross = !isSelected && (selectedCell.row === rIdx || selectedCell.col === cIdx); const isNum = highlightedNumber && cell.value === highlightedNumber; return (<div key={`${rIdx}-${cIdx}`} data-row={rIdx} data-col={cIdx} className={`sudoku-cell ${cell.isGiven ? 'given' : ''} ${isSelected ? 'selected' : ''} ${isCross ? 'cross-highlight' : ''} ${isNum ? 'number-highlight' : ''} ${cell.isError ? 'error' : ''}`} onClick={() => handleCellClick(rIdx, cIdx)}>{cell.value !== 0 ? cell.value : (<div className="sudoku-notes">{cell.notes.map(note => <div key={note} className="sudoku-note">{note}</div>)}</div>)}</div>)}))}</div>}
          {board && (<div className="numpad-container"><div className="numpad-row">{Array.from({ length: size }, (_, i) => i + 1).map(num => (<button key={num} onClick={() => handleValueInput(num)}>{num}</button>))}</div><div className="numpad-actions"><button onClick={handleDelete} className="delete-btn">清除</button></div></div>)}
      </div>
    </div>
  );
};

export default SudokuGame;
