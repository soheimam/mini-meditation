'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

interface CompletionScreenProps {
  stats: MeditationStats;
  onStartNewSession: () => void;
}

const Cloud: React.FC<{ delay?: number; duration?: number; scale?: number; top?: string }> = ({
  delay = 0,
  duration = 20,
  scale = 1,
  top = '20%'
}) => {
  return (
    <motion.div
      className="absolute left-[-100px] opacity-20"
      style={{ top }}
      initial={{ x: -100 }}
      animate={{ x: '120vw' }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'linear'
      }}
    >
      <div 
        className="bg-white rounded-full"
        style={{
          width: `${80 * scale}px`,
          height: `${40 * scale}px`,
        }}
      />
    </motion.div>
  );
};

const CompletionScreen: React.FC<CompletionScreenProps> = ({ stats, onStartNewSession }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#4169E1] p-4 overflow-hidden relative">
      {/* Background Clouds */}
      <Cloud delay={0} duration={30} scale={1.5} top="15%" />
      <Cloud delay={5} duration={25} scale={1} top="35%" />
      <Cloud delay={2} duration={35} scale={2} top="60%" />
      <Cloud delay={8} duration={28} scale={1.2} top="75%" />

      <h1 className="text-4xl font-bold mb-12 text-white relative z-10">Mini Headspace</h1>
      
      <div className="space-y-12 w-full max-w-md text-center relative z-10">
        <div className="flex justify-between items-center px-4">
          <motion.div 
            className="bg-white rounded-full p-6 shadow-lg w-32 h-32 flex flex-col items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-3xl font-bold text-[#4169E1] mb-1">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-gray-600">
              Sessions
            </div>
          </motion.div>
          <motion.div 
            className="bg-white rounded-full p-6 shadow-lg w-32 h-32 flex flex-col items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="text-3xl font-bold text-[#4169E1] mb-1">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">
              Streak
            </div>
          </motion.div>
        </div>
        
        <div className="mt-16">
          <motion.button
            onClick={onStartNewSession}
            className="bg-white hover:bg-gray-100 text-[#4169E1] font-semibold py-4 px-8 rounded-full transition-colors duration-200 text-xl shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Another Session
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen; 