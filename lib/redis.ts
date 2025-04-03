/**
 * Redis Client Configuration
 * 
 * - Uses Upstash Redis for serverless data storage
 * - Stores meditation session data by user (fid)
 * - Tracks total sessions, meditation streaks, and last meditation date
 * - Keys are formatted as `meditation:{fid}` for each user
 */

import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis environment variables are not set')
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Structure for user meditation statistics
 */
interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

/**
 * Retrieves meditation statistics for a specific user
 * @param fid User identifier
 * @returns Current meditation statistics or default values
 */
export async function getMeditationStats(fid: number): Promise<MeditationStats> {
  const key = `meditation:${fid}`;
  const stats = await redis.get<MeditationStats>(key);
  
  return stats || {
    totalSessions: 0,
    currentStreak: 0,
    lastMeditationDate: null,
  };
}

/**
 * Updates meditation statistics after a new session
 * @param fid User identifier
 * @returns Updated meditation statistics with streak calculation
 */
export async function updateMeditationStats(fid: number): Promise<MeditationStats> {
  const key = `meditation:${fid}`;
  const currentStats = await getMeditationStats(fid);
  
  const today = new Date().toISOString().split('T')[0];
  const lastDate = currentStats.lastMeditationDate;

  // Update streak
  let newStreak = currentStats.currentStreak;
  if (lastDate) {
    const lastMeditationDate = new Date(lastDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastMeditationDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      newStreak += 1;
    } else if (lastDate === today) {
      // Already meditated today, streak stays the same
      newStreak = currentStats.currentStreak;
    } else {
      // Streak broken
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const newStats: MeditationStats = {
    totalSessions: currentStats.totalSessions + 1,
    currentStreak: newStreak,
    lastMeditationDate: today,
  };

  await redis.set(key, newStats);
  return newStats;
}
