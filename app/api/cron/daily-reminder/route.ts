import { Redis } from "@upstash/redis";

import { MeditationService } from "@/lib/meditation";
import { getUserNotificationDetails } from "@/lib/notification";
import { type SendNotificationRequest } from "@farcaster/frame-sdk";

// Initialize Redis and meditation service
const redis = Redis.fromEnv();
const meditationService = new MeditationService(redis);
const appUrl = process.env.NEXT_PUBLIC_URL || "";

/**
 * Helper function to determine if a date is more than 24 hours in the past
 * Used to check if we should send a new notification to a user
 */
function isMoreThan24HoursAgo(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffInHours >= 24;
}

/**
 * Sends a notification directly using the token and URL
 */
async function sendDirectNotification({
  token, 
  url, 
  title, 
  body
}: { 
  token: string; 
  url: string; 
  title: string; 
  body: string;
}): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title,
        body,
        targetUrl: appUrl,
        tokens: [token],
      } satisfies SendNotificationRequest),
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('Error sending direct notification:', error);
    return false;
  }
}

/**
 * Cron job endpoint handler that gets triggered on a schedule by Vercel Cron
 * 
 * This function:
 * 1. Checks all users who have enabled meditation reminders
 * 2. Sends notifications only to users who haven't meditated today and 
 *    haven't received a notification in the last 24 hours
 * 3. Updates the lastNotificationSent timestamp for each user who receives a notification
 */
export async function GET(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all user reminder keys
    const reminderKeys = await redis.keys('meditation:reminder:*');
    const notificationsSent = [];
    const errors = [];

    for (const key of reminderKeys) {
      try {
        // Extract user's FID from key
        const fid = parseInt(key.split(':')[2]);
        
        // Get user's reminder preferences
        const preference = await redis.get<{ 
          enabled: boolean; 
          lastNotificationSent?: string;
          token?: string;
          url?: string;
        }>(key);
        
        // Skip if reminders disabled
        if (!preference?.enabled) continue;

        // Skip if notification sent in last 24 hours
        if (preference.lastNotificationSent && !isMoreThan24HoursAgo(preference.lastNotificationSent)) {
          continue;
        }

        // Get user's meditation stats
        const stats = await meditationService.getMeditationStats(fid);
        
        // Check if user meditated today
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastMeditationDate !== today) {
          // Try sending notification
          let notificationSent = false;
          
          // First, try using token and URL from preference if available
          if (preference.token && preference.url) {
            notificationSent = await sendDirectNotification({
              token: preference.token,
              url: preference.url,
              title: "Daily Meditation Reminder",
              body: "Take a moment to breathe and center yourself with a meditation session."
            });
            
            if (notificationSent) {
              console.log(`Notification sent using preference token for FID ${fid}`);
            } else {
              console.warn(`Failed to send notification with preference token for FID ${fid}`);
            }
          }
          
          // If that didn't work, try using the notification service as a fallback
          if (!notificationSent) {
            // Get notification details from the notification system
            const notificationDetails = await getUserNotificationDetails(fid);
            
            if (notificationDetails?.token && notificationDetails?.url) {
              notificationSent = await sendDirectNotification({
                token: notificationDetails.token,
                url: notificationDetails.url,
                title: "Daily Meditation Reminder",
                body: "Take a moment to breathe and center yourself with a meditation session."
              });
              
              if (notificationSent) {
                console.log(`Notification sent using notification service for FID ${fid}`);
              } else {
                console.warn(`Failed to send notification via notification service for FID ${fid}`);
              }
            } else {
              console.warn(`No notification details found for FID ${fid}`);
            }
          }

          if (notificationSent) {
            // Update last notification timestamp
            await redis.set(key, {
              ...preference,
              lastNotificationSent: new Date().toISOString()
            });

            notificationsSent.push(fid);
          }
        }
      } catch (error) {
        // Log user-specific errors
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
    // Log global errors
    console.error('Error in daily reminder cron:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 