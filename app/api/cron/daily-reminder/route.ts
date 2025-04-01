import { Redis } from "@upstash/redis";
import { sendFrameNotification } from "@/lib/notification-client";
import { MeditationService } from "@/lib/meditation";

const redis = Redis.fromEnv();
const meditationService = new MeditationService(redis);

// Helper to check if a date is more than 24 hours ago
function isMoreThan24HoursAgo(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours >= 24;
}

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all reminder keys
    const reminderKeys = await redis.keys('meditation:reminder:*');
    const notificationsSent = [];
    const errors = [];

    for (const key of reminderKeys) {
      try {
        // Extract FID from key
        const fid = parseInt(key.split(':')[2]);
        
        // Get reminder preferences
        const preference = await redis.get<{ enabled: boolean; lastNotificationSent?: string }>(key);
        
        if (!preference?.enabled) continue;

        // Check if we should send a notification (more than 24h since last one)
        if (preference.lastNotificationSent && !isMoreThan24HoursAgo(preference.lastNotificationSent)) {
          continue;
        }

        // Get meditation stats to check last session
        const stats = await meditationService.getMeditationStats(fid);
        
        // If they haven't meditated today, send a reminder
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastMeditationDate !== today) {
          await sendFrameNotification({
            fid,
            title: "Daily Meditation Reminder",
            body: "Take a moment to breathe and center yourself with a meditation session.",
          });

          // Update last notification time
          await redis.set(key, {
            ...preference,
            lastNotificationSent: new Date().toISOString()
          });

          notificationsSent.push(fid);
        }
      } catch (error) {
        console.error(`Error processing reminder for key ${key}:`, error);
        errors.push({ key, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return Response.json({
      success: true,
      notificationsSent,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in daily reminder cron:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 