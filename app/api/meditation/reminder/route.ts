import { sendFrameNotification } from "@/lib/notification-client";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    // Get all users who have enabled notifications
    const users = await redis.smembers("meditation:reminder:users");
    
    const notifications = users.map(async (fid) => {
      return sendFrameNotification({
        fid: parseInt(fid),
        title: "Time to Meditate! 🧘‍♂️",
        body: "Take a minute to breathe and center yourself. Your daily meditation awaits.",
      });
    });

    await Promise.all(notifications);
    
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error sending meditation reminders:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}

// Endpoint to opt-in/out of reminders
export async function PUT(request: Request) {
  const fid = request.headers.get("X-Farcaster-FID");
  
  if (!fid) {
    return Response.json({ error: "FID is required" }, { status: 400 });
  }

  try {
    const { enabled } = await request.json();
    const key = "meditation:reminder:users";

    if (enabled) {
      await redis.sadd(key, fid);
    } else {
      await redis.srem(key, fid);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating reminder preferences:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const fid = request.headers.get("X-Farcaster-FID");
  
  if (!fid) {
    return Response.json({ error: "FID is required" }, { status: 400 });
  }

  try {
    const isEnabled = await redis.sismember("meditation:reminder:users", fid);
    return Response.json({ enabled: isEnabled });
  } catch (error) {
    console.error("Error fetching reminder preferences:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 