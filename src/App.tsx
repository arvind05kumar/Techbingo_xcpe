import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { BingoCell } from './components/BingoCell';
import { Leaderboard } from './components/Leaderboard';
import { ProgressBar } from './components/ProgressBar';
import { Welcome } from './components/Welcome';
import { sampleQuestions } from './data/questions';
import { GameState, Question, LeaderboardEntry } from './types';
import { Brain } from 'lucide-react';

const BOARD_SIZE = 5;
const GAME_TIME = 600; // 10 minutes in seconds
const ROW_POINTS = 1;
const COLUMN_POINTS = 2;
const DIAGONAL_POINTS = 3;
const EARLY_SUBMISSION_POINTS = 2;
const CELL_POINTS = 10;

const initialGameState: GameState = {
  board: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
  answers: {},
  correctAnswers: new Set(),
  wrongAnswers: new Set(),
  timeLeft: GAME_TIME,
  gameOver: false,
  score: 0,
  completedLines: {
    rows: [],
    columns: [],
    diagonals: []
  },
  submitted: false
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);

  const shuffleQuestions = useCallback(() => {
    const shuffled = [...sampleQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(0, BOARD_SIZE * BOARD_SIZE)
      .map((q, id) => ({ ...q, id }));

    setGameState(prev => ({
      ...prev,
      board: shuffled,
      answers: {},
      correctAnswers: new Set(),
      wrongAnswers: new Set(),
      timeLeft: GAME_TIME,
      gameOver: false,
      score: 0,
      completedLines: { rows: [], columns: [], diagonals: [] },
      submitted: false
    }));
  }, []);

  useEffect(() => {
    if (gameStarted) {
      shuffleQuestions();
    }
  }, [gameStarted, shuffleQuestions]);

  const handleStart = (name: string) => {
    setPlayerName(name);
    setGameStarted(true);
  };

  const checkLine = useCallback(() => {
    const board = gameState.board as Question[];
    const correct = gameState.correctAnswers;
    const newCompletedLines = {
      rows: [] as number[],
      columns: [] as number[],
      diagonals: [] as number[]
    };
    let hasWinningLine = false;

    for (let i = 0; i < BOARD_SIZE; i++) {
      const row = Array.from({ length: BOARD_SIZE }, (_, j) => {
        const cell = board[i * BOARD_SIZE + j];
        return cell ? cell.id : null;
      });
      if (row.every(id => id !== null && correct.has(id))) {
        hasWinningLine = true;
        if (!gameState.completedLines.rows.includes(i)) {
          newCompletedLines.rows.push(i);
        }
      }
    }

    for (let i = 0; i < BOARD_SIZE; i++) {
      const col = Array.from({ length: BOARD_SIZE }, (_, j) => {
        const cell = board[j * BOARD_SIZE + i];
        return cell ? cell.id : null;
      });
      if (col.every(id => id !== null && correct.has(id))) {
        hasWinningLine = true;
        if (!gameState.completedLines.columns.includes(i)) {
          newCompletedLines.columns.push(i);
        }
      }
    }

    const diag1 = Array.from({ length: BOARD_SIZE }, (_, i) => {
      const cell = board[i * BOARD_SIZE + i];
      return cell ? cell.id : null;
    });
    const diag2 = Array.from({ length: BOARD_SIZE }, (_, i) => {
      const cell = board[i * BOARD_SIZE + (BOARD_SIZE - 1 - i)];
      return cell ? cell.id : null;
    });

    if (diag1.every(id => id !== null && correct.has(id))) {
      hasWinningLine = true;
      if (!gameState.completedLines.diagonals.includes(0)) {
        newCompletedLines.diagonals.push(0);
      }
    }
    if (diag2.every(id => id !== null && correct.has(id))) {
      hasWinningLine = true;
      if (!gameState.completedLines.diagonals.includes(1)) {
        newCompletedLines.diagonals.push(1);
      }
    }

    return { hasWinningLine, newCompletedLines };
  }, [gameState.board, gameState.correctAnswers, gameState.completedLines]);

  const calculateScore = useCallback(() => {
    // Only cell points, no extra for rows/columns
    return gameState.correctAnswers.size * CELL_POINTS;
  }, [gameState.correctAnswers.size]);

  const handleCellClick = (index: number) => {
    if (gameState.gameOver || gameState.submitted) return;
    setSelectedCell(index);
    setCurrentAnswer(gameState.answers[index] || '');
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCell === null || gameState.gameOver || gameState.submitted) return;

    const question = gameState.board[selectedCell] as Question;
    if (!question) return;

    const isCorrect = currentAnswer.toLowerCase() === question.answer.toLowerCase();

    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [selectedCell]: currentAnswer },
      correctAnswers: isCorrect ? new Set([...prev.correctAnswers, question.id]) : prev.correctAnswers,
      wrongAnswers: !isCorrect ? new Set([...prev.wrongAnswers, question.id]) : prev.wrongAnswers,
    }));

    setCurrentAnswer('');
    setSelectedCell(null);
  };

  const handleGameSubmit = () => {
  // We still call checkLine so any completed lines are captured,
  // but we do NOT block submission if there are none.
  const { newCompletedLines } = checkLine();

  const finalScore = calculateScore(newCompletedLines, gameState.timeLeft);
  setGameState(prev => ({
    ...prev,
    gameOver: true,
    score: finalScore,
    completedLines: {
      rows: [...prev.completedLines.rows, ...newCompletedLines.rows],
      columns: [...prev.completedLines.columns, ...newCompletedLines.columns],
      diagonals: [...prev.completedLines.diagonals, ...newCompletedLines.diagonals]
    },
    submitted: true
  }));


    setLeaderboard(prev => {
      const newEntry = {
        username: playerName,
        highScore: finalScore,
        timeLeft: gameState.timeLeft,
        rank: 0
      };
      const newLeaderboard = [...prev, newEntry]
        .sort((a, b) => b.highScore - a.highScore)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
      return newLeaderboard;
    });
  };

  if (!gameStarted) {
    return (
      <Welcome onStart={handleStart} />
    );
  }

  if (gameState.gameOver) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundImage: 'url(/background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        className="py-12"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              {gameState.timeLeft <= 0 ? "Time's Up!!!" : "Game Finished!"}
            </h1>
            <p className="text-xl text-white mb-4">Final Score: {gameState.score}</p>
          </div>
          <Leaderboard
            entries={leaderboard}
            onPlayAgain={() => {
              shuffleQuestions();
              setGameStarted(true);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      className="py-8 px-4"
    >
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" style={{ color: '#052F3A' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#052F3A' }}>
              TECH-BINGOO
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-lg font-medium text-gray-700">Player: {playerName}</p>
            <Timer
              timeLeft={gameState.timeLeft}
              setTimeLeft={(time) => setGameState(prev => ({ ...prev, timeLeft: time }))}
              onTimeUp={() => setGameState(prev => ({ ...prev, gameOver: true }))}
            />
          </div>
        </div>

        <ProgressBar gameState={gameState} />

        <div className="grid grid-cols-5 gap-4 mb-8">
          {gameState.board.map((cell, index) => (
            <BingoCell
              key={index}
              question={cell?.question || ''}
              isCorrect={
                cell
                  ? gameState.correctAnswers.has(cell.id)
                    ? true
                    : gameState.wrongAnswers.has(cell.id)
                    ? false
                    : null
                  : null
              }
              onClick={() => handleCellClick(index)}
              isSelected={selectedCell === index}
            />
          ))}
        </div>

        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <input
              type="text"
              id="answer"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Type your answer here..."
              disabled={selectedCell === null || gameState.gameOver || gameState.submitted}
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={selectedCell === null || gameState.gameOver || gameState.submitted}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg 
                hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 
                disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Submit Answer
            </button>
            <button
              type="button"
              onClick={handleGameSubmit}
              disabled={gameState.gameOver || gameState.submitted}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg 
                hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 
                disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              Submit Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
