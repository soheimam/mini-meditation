import { MeditationService } from "@/lib/meditation";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const meditationService = new MeditationService(redis);

export async function GET(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await meditationService.getMeditationStats(parseInt(fid));
    return Response.json(stats);
  } catch (error) {
    console.error('Error getting meditation stats:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 