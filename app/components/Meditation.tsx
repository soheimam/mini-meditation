'use client';

import React, { useState, useEffect, useRef } from 'react';
import CompletionScreen from './CompletionScreen';
import BreathingCircle from './BreathingCircle';
import { useMiniKit } from '@coinbase/onchainkit/minikit';


interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

const Meditation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isCompleted, setIsCompleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    currentStreak: 0,
    lastMeditationDate: null,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout>();
  const { context } = useMiniKit();

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
    if (!isActive || isCompleted) {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
      return;
    }

    const nextPhase = () => {
      setPhase(currentPhase => {
        switch (currentPhase) {
          case 'inhale':
            return 'hold';
          case 'hold':
            return 'exhale';
          case 'exhale':
            return 'inhale';
          default:
            return 'inhale';
        }
      });
    };

    phaseTimerRef.current = setTimeout(nextPhase, 4000);

    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [phase, isActive, isCompleted]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            console.log('Updating meditation stats');
            // Update stats in API
            fetch('/api/meditation/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Farcaster-FID': context?.user.fid.toString() ?? '',
              },
            })
              .then(response => response.json())
              .then(data => setStats(data))
              .catch(error => console.error('Failed to update meditation stats:', error));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive, timeRemaining]);

  const handleStart = () => {
    setIsActive(true);
    setTimeRemaining(60);
    setPhase('inhale');
    setIsCompleted(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    }
  };

  const toggleNotifications = async () => {
    try {
      const response = await fetch('/api/meditation/reminder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !notificationsEnabled }),
      });
      
      if (response.ok) {
        setNotificationsEnabled(!notificationsEnabled);
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  if (isCompleted) {
    return <CompletionScreen stats={stats} onStartNewSession={handleStart} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 p-4">
      <audio
        ref={audioRef}
        src="/sound/evening-birds-singing-in-spring-background-sounds-of-nature-146388.mp3"
        loop
      />
      <div className="flex flex-col items-center justify-center max-w-md w-full text-center space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Mini Headspace</h1>
        
        {!isActive ? (
          <>
            <button
              onClick={handleStart}
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-6 rounded-full transition-colors duration-200 shadow-lg"
            >
              Start Meditation
            </button>
            <button
              onClick={toggleNotifications}
              className={`mt-4 text-sm font-semibold py-2 px-4 rounded-full transition-colors duration-200 ${
                notificationsEnabled 
                  ? 'bg-white text-blue-600' 
                  : 'bg-blue-500 text-white border border-white'
              }`}
            >
              {notificationsEnabled ? '🔔 Daily Reminders On' : '🔕 Enable Daily Reminders'}
            </button>
          </>
        ) : (
          <div className="space-y-8">
            <BreathingCircle phase={phase} />
            <div className="text-2xl font-light text-white mb-4">
              {phase === 'inhale' && 'Breathe In'}
              {phase === 'hold' && 'Hold'}
              {phase === 'exhale' && 'Breathe Out'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meditation; 