import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { getOpenAIClient } from '@/lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// List files
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const client = getOpenAIClient();
    const files = await client.files.list();
    return NextResponse.json({ files: files.data });
  } catch (err: any) {
    const message = err?.message || 'Failed to list files';
    const status = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|unavailable/i.test(String(message)) ? 502 : 500;
    return NextResponse.json({ error: 'OpenAI unavailable', message }, { status });
  }
}

const FILE_PURPOSES = [
  'assistants',
  'batch',
  'fine-tune',
  'vision',
  'user_data',
  'evals',
] as const;

const UploadSchema = z.object({
  purpose: z.enum(FILE_PURPOSES).default('assistants'),
});

// Upload file (multipart/form-data)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    const form = await req.formData();
    const parsed = UploadSchema.safeParse({ purpose: String(form.get('purpose') || 'assistants') });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const client = getOpenAIClient();
    const uploaded = await client.files.create({
      file: new Blob([fileBuffer], { type: file.type || 'application/octet-stream' }) as any,
      purpose: parsed.data.purpose,
    });

    return NextResponse.json({ file: uploaded });
  } catch (err: any) {
    const message = err?.message || 'Failed to upload file';
    const status = /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|unavailable/i.test(String(message)) ? 502 : 500;
    return NextResponse.json({ error: 'OpenAI unavailable', message }, { status });
  }
}

