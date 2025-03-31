import { MeditationService } from "@/lib/meditation";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const meditationService = new MeditationService(redis);

export async function POST(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await meditationService.updateMeditationStats(parseInt(fid));
    return Response.json(stats);
  } catch (error) {
    console.error('Error updating meditation stats:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 