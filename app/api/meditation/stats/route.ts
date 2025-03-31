import { getMeditationStats } from "@/lib/meditation";

export async function GET(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await getMeditationStats(parseInt(fid));
    return Response.json(stats);
  } catch (error) {
    console.error('Error getting meditation stats:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 