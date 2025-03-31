import { updateMeditationStats } from "@/lib/meditation";

export async function POST(request: Request) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await updateMeditationStats(parseInt(fid));
    return Response.json(stats);
  } catch (error) {
    console.error('Error updating meditation stats:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 