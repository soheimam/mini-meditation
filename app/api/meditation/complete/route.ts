import { MeditationService } from "@/lib/meditation";
import { Redis } from "@upstash/redis";
import { sendFrameNotification } from "@/lib/notification-client";

const redis = Redis.fromEnv();
const meditationService = new MeditationService(redis);

export async function POST(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await meditationService.updateMeditationStats(parseInt(fid));
    
    // Check if user has notifications enabled
    const isSubscribed = await redis.sismember("meditation:reminder:users", fid);
    
    if (isSubscribed) {
      // Schedule reminder for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow
      
      const now = new Date();
      const delay = tomorrow.getTime() - now.getTime();
      
      // Use setTimeout to send notification tomorrow
      setTimeout(async () => {
        try {
          await sendFrameNotification({
            fid: parseInt(fid),
            title: "Time to Meditate! 🧘‍♂️",
            body: "Take a minute to breathe and center yourself. Your daily meditation awaits.",
          });
        } catch (error) {
          console.error("Failed to send meditation reminder:", error);
        }
      }, delay);
    }

    return Response.json(stats);
  } catch (error) {
    console.error('Error updating meditation stats:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 