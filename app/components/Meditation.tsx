'use client';

import React, { useState, useEffect, useRef } from 'react';
import CompletionScreen from './CompletionScreen';
import BreathingCircle from './BreathingCircle';
import { useMiniKit, useAddFrame } from '@coinbase/onchainkit/minikit';

import WalletControl from './WalletControl';
import MeditationWalletButton from './MeditationWalletButton';

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

interface NotificationToast {
  show: boolean;
  message: string;
  isSuccess: boolean;
}

const Meditation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isCompleted, setIsCompleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toast, setToast] = useState<NotificationToast>({
    show: false,
    message: '',
    isSuccess: false
  });
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    currentStreak: 0,
    lastMeditationDate: null,
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout>();
  const { context } = useMiniKit();
  const addFrame = useAddFrame();
  
  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // API: Fetches user's meditation statistics (total sessions, current streak, last meditation date)
        // GET /api/meditation/stats returns the user's meditation history and progress
        const response = await fetch('/api/meditation/stats', {
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
    const fetchNotificationPreference = async () => {
      try {
        // API: Retrieves user's notification preferences for meditation reminders
        // GET /api/meditation/reminder checks if the user has enabled daily reminders
        const response = await fetch('/api/meditation/reminder', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Farcaster-FID': context?.user.fid.toString() ?? '',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificationsEnabled(data.enabled);
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
      }
    };

    if (context?.user.fid) {
      fetchNotificationPreference();
    }
  }, [context?.user.fid]);

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
            // API: Records completed meditation session and updates user stats
            // POST /api/meditation/complete registers a completed session and returns updated stats
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
    const fid = context?.user.fid;
    if (!fid) return;

    try {
      if (!notificationsEnabled) {
        const result = await addFrame();
        if (!result) {
          setToast({
            show: true,
            message: "Frame access was denied. Notifications can't be enabled.",
            isSuccess: false
          });
          return;
        }

        // Save the token + url in backend
        await fetch('/api/meditation/reminder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Farcaster-FID': fid.toString(),
          },
          body: JSON.stringify({
            enabled: true,
            token: result.token,
            url: result.url,
          }),
        });

        setToast({
          show: true,
          message: "Daily meditation reminders are now enabled!",
          isSuccess: true
        });
      } else {
        // Disable notifications in Redis
        await fetch('/api/meditation/reminder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Farcaster-FID': fid.toString(),
          },
          body: JSON.stringify({
            enabled: false,
          }),
        });

        setToast({
          show: true,
          message: "Daily reminders have been disabled",
          isSuccess: true
        });
      }

      setNotificationsEnabled(!notificationsEnabled);
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      setToast({
        show: true,
        message: "There was an error with notification settings",
        isSuccess: false
      });
    }
  };

  // Component rendering logic:
  // When a session is completed (isCompleted=true), we show the CompletionScreen component
  // This happens after the countdown timer reaches zero or when a session finishes
  // The CompletionScreen displays statistics and allows starting a new session
  if (isCompleted) {
    return (
      <>
        <CompletionScreen 
          stats={stats} 
          onStartNewSession={handleStart} 
          notificationsEnabled={notificationsEnabled}
          toggleNotifications={toggleNotifications}
        />
        {toast.show && (
          <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg z-50 ${
            toast.isSuccess ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {toast.message}
          </div>
        )}
      </>
    );
  }

  // Main meditation interface is shown when not in completed state
  // This displays either the start button or the active breathing exercise
  // depending on the isActive state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-400 p-4 relative">
      <WalletControl />
      <audio
        ref={audioRef}
        src="/sound/evening-birds-singing-in-spring-background-sounds-of-nature-146388.mp3"
        loop
      />
      <div className="flex flex-col items-center justify-center max-w-md w-full text-center space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-white">Mini Headspace</h1>
        
        {!isActive ? (
          <>
            <MeditationWalletButton onStart={handleStart} />
          </>
        ) : (
          <div className="space-y-8">
            <BreathingCircle phase={phase} timeRemaining={timeRemaining} totalTime={60} />
            <div className="text-2xl font-light text-white mb-4">
              {phase === 'inhale' && 'Breathe In'}
              {phase === 'hold' && 'Hold'}
              {phase === 'exhale' && 'Breathe Out'}
            </div>
          </div>
        )}
      </div>
      
      {toast.show && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg z-50 ${
          toast.isSuccess ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Meditation; 