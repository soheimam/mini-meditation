import { redis } from "./redis";

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

const meditationServiceKey = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "minikit";

function getUserMeditationKey(fid: number): string {
  return `${meditationServiceKey}:meditation:${fid}`;
}

export async function getMeditationStats(fid: number): Promise<MeditationStats> {
  if (!redis) {
    return {
      totalSessions: 0,
      currentStreak: 0,
      lastMeditationDate: null,
    };
  }

  const stats = await redis.get<MeditationStats>(getUserMeditationKey(fid));
  return stats ?? {
    totalSessions: 0,
    currentStreak: 0,
    lastMeditationDate: null,
  };
}

export async function updateMeditationStats(fid: number): Promise<MeditationStats> {
  if (!redis) {
    return {
      totalSessions: 0,
      currentStreak: 0,
      lastMeditationDate: null,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const currentStats = await getMeditationStats(fid);
  
  // Update total sessions
  const totalSessions = currentStats.totalSessions + 1;
  
  // Calculate streak
  let currentStreak = 1; // Default to 1 for first session
  
  if (currentStats.lastMeditationDate) {
    const lastDate = new Date(currentStats.lastMeditationDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
      // If last meditation was yesterday, increment streak
      currentStreak = currentStats.currentStreak + 1;
    } else if (lastDate.toISOString().split('T')[0] === today) {
      // If already meditated today, keep same streak
      currentStreak = currentStats.currentStreak;
    }
    // If last meditation was before yesterday, streak resets to 1 (default)
  }

  const newStats: MeditationStats = {
    totalSessions,
    currentStreak,
    lastMeditationDate: today,
  };

  await redis.set(getUserMeditationKey(fid), newStats);
  return newStats;
} 