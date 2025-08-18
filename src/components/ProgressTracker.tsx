import React from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle, Circle, Star } from 'lucide-react';

interface ProgressTrackerProps {
  currentIndex: number;
  totalWords: number;
  correctAnswers: number;
  totalAttempts: number;
  playerName: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentIndex,
  totalWords,
  correctAnswers,
  totalAttempts,
  playerName
}) => {
  const progressPercentage = ((currentIndex + 1) / totalWords) * 100;
  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

  return (
    <Card className="p-4 mb-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold text-purple-800">{playerName}'s Progress</span>
        </div>
        <div className="text-sm text-gray-600">
          Word {currentIndex + 1} of {totalWords}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {/* Word Progress Dots */}
      <div className="flex justify-center gap-1 mb-4 flex-wrap">
        {Array.from({ length: totalWords }, (_, index) => {
          let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
          
          if (index < currentIndex) {
            status = 'completed';
          } else if (index === currentIndex) {
            status = 'current';
          }

          return (
            <div
              key={index}
              className={`
                w-3 h-3 rounded-full border-2 transition-all duration-300
                ${status === 'completed' ? 'bg-green-500 border-green-500' : ''}
                ${status === 'current' ? 'bg-blue-500 border-blue-500 animate-pulse scale-125' : ''}
                ${status === 'upcoming' ? 'bg-gray-200 border-gray-300' : ''}
              `}
            />
          );
        })}
      </div>

      {/* Stats */}
      {totalAttempts > 0 && (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">{correctAnswers}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="bg-white rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">{Math.round(accuracy)}%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
        </div>
      )}
    </Card>
  );
};