import { Redis } from "@upstash/redis";

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

export class MeditationService {
  private readonly meditationServiceKey: string;

  constructor(private readonly redis: Redis) {
    this.meditationServiceKey = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "minikit";
  }

  private getUserMeditationKey(fid: number): string {
    return `${this.meditationServiceKey}:meditation:${fid}`;
  }

  async getMeditationStats(fid: number): Promise<MeditationStats> {
    const stats = await this.redis.get<MeditationStats>(this.getUserMeditationKey(fid));
    return stats ?? {
      totalSessions: 0,
      currentStreak: 0,
      lastMeditationDate: null,
    };
  }

  async updateMeditationStats(fid: number): Promise<MeditationStats> {
    const today = new Date().toISOString().split('T')[0];
    const currentStats = await this.getMeditationStats(fid);
    
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

    await this.redis.set(this.getUserMeditationKey(fid), newStats);
    return newStats;
  }
} 