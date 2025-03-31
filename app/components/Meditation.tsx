'use client';

import React, { useState, useEffect } from 'react';
import CompletionScreen from './CompletionScreen';
import BreathingCircle from './BreathingCircle';

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

const Meditation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [breathCount, setBreathCount] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isCompleted, setIsCompleted] = useState(false);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    currentStreak: 0,
    lastMeditationDate: null,
  });
  const totalCycles = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/meditation', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch meditation stats:', error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive) {
      // Breathing cycle timing (in milliseconds)
      const inhaleTime = 4000; // 4 seconds
      const holdTime = 4000;   // 4 seconds
      const exhaleTime = 4000; // 4 seconds

      if (phase === 'inhale') {
        timer = setTimeout(() => {
          setPhase('hold');
        }, inhaleTime);
      } else if (phase === 'hold') {
        timer = setTimeout(() => {
          setPhase('exhale');
        }, holdTime);
      } else {
        timer = setTimeout(() => {
          setPhase('inhale');
          setBreathCount((prev) => {
            if (prev + 1 >= totalCycles) {
              setIsActive(false);
              setIsCompleted(true);
              // Update stats in API
              fetch('/api/meditation', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
                .then(response => response.json())
                .then(data => setStats(data))
                .catch(error => console.error('Failed to update meditation stats:', error));
              return 0;
            }
            return prev + 1;
          });
        }, exhaleTime);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
    setBreathCount(0);
    setPhase('inhale');
    setIsCompleted(false);
  };

  if (isCompleted) {
    return <CompletionScreen stats={stats} onStartNewSession={handleStart} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 p-4">
      <div className="flex flex-col items-center justify-center max-w-md w-full text-center space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Mini Headspace</h1>
        
        {!isActive ? (
          <button
            onClick={handleStart}
            className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 rounded-full transition-colors duration-200 shadow-lg"
          >
            Start Meditation
          </button>
        ) : (
          <div className="space-y-8">
            <BreathingCircle phase={phase} />
            <div className="text-2xl font-light text-white mb-4">
              {phase === 'inhale' && 'Breathe In'}
              {phase === 'hold' && 'Hold'}
              {phase === 'exhale' && 'Breathe Out'}
            </div>
            <div className="text-xl text-white">
              Breath Cycle: {breathCount + 1} / {totalCycles}
            </div>
            <div className="h-4 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{
                  width: `${((breathCount + 1) / totalCycles) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation; 