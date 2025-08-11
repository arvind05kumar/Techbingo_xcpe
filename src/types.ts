import { Question } from './types';

export interface GameState {
  board: (Question | null)[];
  answers: { [key: number]: string };
  correctAnswers: Set<number>;
  wrongAnswers: Set<number>;
  timeLeft: number;
  gameOver: boolean;
  score: number;
  completedLines: {
    rows: number[];
    columns: number[];
    diagonals: number[];
  };
  submitted: boolean;
}

export interface Question {
  id: number;
  question: string;
  answer: string;
}

export interface Player {
  id: string;
  username: string;
  highScore: number;
  gamesPlayed: number;
}

export interface LeaderboardEntry {
  username: string;
  highScore: number;
  rank: number;
  timeLeft?: number;
}