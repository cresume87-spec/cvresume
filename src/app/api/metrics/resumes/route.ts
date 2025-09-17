import { NextResponse } from 'next/server';

// NOTE: In-memory store for now. Replace with DB persistence later.
let CREATED_RESUMES_COUNT = 16356;

export async function GET() {
  try {
    return NextResponse.json({ count: CREATED_RESUMES_COUNT }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' } });
  } catch (e) {
    return NextResponse.json({ count: 16356 }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const incRaw = Number(body?.increment ?? 0);
    const inc = Number.isFinite(incRaw) ? Math.max(0, Math.floor(incRaw)) : 0;
    CREATED_RESUMES_COUNT += inc;
    return NextResponse.json({ count: CREATED_RESUMES_COUNT }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ count: CREATED_RESUMES_COUNT }, { status: 200 });
  }
}

