import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { generateText } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  prompt: z.string().min(1, 'prompt is required'),
  system: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  model: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const raw = await req.json().catch(() => ({}));
    const { prompt, system, temperature, model } = BodySchema.parse(raw);

    const text = await generateText({ prompt, system, temperature, model });
    return NextResponse.json({ text });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input', details: err.flatten() }, { status: 400 });
    }
    const message = err?.message || 'Failed to generate';
    const status = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|unavailable/i.test(String(message)) ? 502 : 500;
    return NextResponse.json({ error: 'OpenAI unavailable', message }, { status });
  }
}


