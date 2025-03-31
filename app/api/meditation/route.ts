import { NextRequest } from 'next/server';
import { getMeditationStats, updateMeditationStats } from '@/lib/redis';

interface MeditationStats {
  totalSessions: number;
  currentStreak: number;
  lastMeditationDate: string | null;
}

// In-memory store for demo purposes. In production, use a proper database
const meditationStats = new Map<number, MeditationStats>();

export async function GET(request: NextRequest) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await getMeditationStats(parseInt(fid));
    return Response.json(stats);
  } catch (error) {
    console.error('Failed to fetch meditation stats:', error);
    return Response.json({ error: 'Failed to fetch meditation stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const fid = request.headers.get('X-Farcaster-FID');
  
  if (!fid) {
    return Response.json({ error: 'FID is required' }, { status: 400 });
  }

  try {
    const stats = await updateMeditationStats(parseInt(fid));
    return Response.json(stats);
  } catch (error) {
    console.error('Failed to update meditation stats:', error);
    return Response.json({ error: 'Failed to update meditation stats' }, { status: 500 });
  }
} 