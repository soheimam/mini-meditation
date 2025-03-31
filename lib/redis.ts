import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis environment variables are not set')
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

export async function getMeditationStats(fid: number): Promise<MeditationStats> {
  const key = `meditation:${fid}`;
  const stats = await redis.get<MeditationStats>(key);
  
  return stats || {
    totalSessions: 0,
    currentStreak: 0,
    lastMeditationDate: null,
  };
}

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
