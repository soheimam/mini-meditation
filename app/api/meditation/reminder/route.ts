import { Redis } from "@upstash/redis";
import { setUserNotificationDetails } from "@/lib/notification";

const redis = Redis.fromEnv();

interface ReminderPreference {
  enabled: boolean;
  lastNotificationSent?: string;
  token?: string;
  url?: string;
}

function getUserReminderKey(fid: number): string {
  return `meditation:reminder:${fid}`;
}

export async function POST(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const { enabled, token, url } = await request.json();

    if (typeof enabled !== 'boolean') {
      return Response.json({ error: 'enabled must be a boolean' }, { status: 400 });
    }

    const preference: ReminderPreference = {
      enabled,
      lastNotificationSent: enabled ? new Date().toISOString() : undefined
    };

    // If token and url are provided, store them for notifications
    if (enabled && token && url) {
      preference.token = token;
      preference.url = url;
      
      // Also store the notification details using the notification system
      await setUserNotificationDetails(parseInt(fid), { token, url });
    }

    await redis.set(getUserReminderKey(parseInt(fid)), preference);
    
    return Response.json({ success: true, preference });
  } catch (error) {
    console.error('Error updating reminder preferences:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current reminder preferences
export async function GET(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const preference = await redis.get<ReminderPreference>(getUserReminderKey(parseInt(fid)));
    
    return Response.json(preference || { enabled: false });
  } catch (error) {
    console.error('Error getting reminder preferences:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
