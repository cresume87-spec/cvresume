import { NextResponse } from 'next/server';
import { getResumeCreatedCount } from '@/lib/siteMetrics';

export async function GET() {
  try {
    const count = await getResumeCreatedCount();
    return NextResponse.json(
      { count },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } },
    );
  } catch {
    return NextResponse.json({ count: 16356 }, { status: 200 });
  }
}
