import React from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Award, Medal, Clock } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  onPlayAgain: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, onPlayAgain }) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Award className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">Leaderboard</h2>
      
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.username + entry.rank}
            className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
          >
            <div className="flex items-center space-x-4">
              <span className="w-8 text-center font-bold text-indigo-600">
                {getRankIcon(entry.rank) || `#${entry.rank}`}
              </span>
              <span className="font-medium text-gray-900">{entry.username}</span>
            </div>
            <div className="flex items-center gap-4">
              {entry.timeLeft !== undefined && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(entry.timeLeft)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};