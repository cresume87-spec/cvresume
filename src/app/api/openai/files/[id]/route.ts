import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOpenAIClient } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const client = getOpenAIClient();
    const result = await client.files.delete(id);
    return NextResponse.json({ deleted: result.deleted, id: result.id });
  } catch (err: any) {
    const message = err?.message || 'Failed to delete file';
    const status = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|unavailable/i.test(String(message)) ? 502 : 500;
    return NextResponse.json({ error: 'OpenAI unavailable', message }, { status });
  }
}



