'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale';
  timeRemaining: number;
  totalTime: number;
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({ 
  phase, 
  timeRemaining, 
  totalTime 
}) => {
  const circleVariants = {
    inhale: {
      scale: 0.5,
      transition: {
        duration: 4,
        ease: "easeInOut"
      }
    },
    hold: {
      scale: 0.5,
      transition: {
        duration: 4,
        ease: "linear"
      }
    },
    exhale: {
      scale: 1,
      transition: {
        duration: 4,
        ease: "easeInOut"
      }
    }
  };

  const getStatusBarColor = () => {
    switch (phase) {
      case 'inhale': return 'bg-blue-400';
      case 'hold': return 'bg-purple-400';
      case 'exhale': return 'bg-green-400';
      default: return 'bg-blue-400';
    }
  };

  // Calculate progress percentage based on time remaining
  const progressPercentage = ((totalTime - timeRemaining) / totalTime) * 100;

  return (
    <div className="relative w-64 h-64">
      <motion.div
        className="absolute inset-0"
        animate={phase}
        variants={circleVariants}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-b from-yellow-400 to-yellow-300 shadow-lg flex items-center justify-center">
          <motion.div
            className="text-orange-500 text-4xl"
            initial={false}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ⌣
          </motion.div>
        </div>
      </motion.div>
      {/* Decorative clouds */}
      <div className="absolute -right-8 top-0 w-12 h-8 bg-white rounded-full" />
      <div className="absolute -left-8 bottom-8 w-12 h-8 bg-white rounded-full" />
      
      {/* Status bar showing overall session progress */}
      <div className="absolute -bottom-8 left-0 w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${getStatusBarColor()} rounded-full opacity-70`}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default BreathingCircle; 