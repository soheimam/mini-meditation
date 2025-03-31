'use client';

import { motion } from 'framer-motion';
import React from 'react';

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale';
}

const BreathingCircle: React.FC<BreathingCircleProps> = ({ phase }) => {
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
    </div>
  );
};

export default BreathingCircle; 