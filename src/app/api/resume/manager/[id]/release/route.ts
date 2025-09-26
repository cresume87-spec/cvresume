import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { id: string };

function extractReleaseAt(payload: any): string | null {
  if (!payload) return null;
  const meta = typeof payload.meta === 'object' && payload.meta !== null ? payload.meta : {};
  const direct = typeof payload.releaseAt === 'string' ? payload.releaseAt : null;
  const nested = typeof meta.releaseAt === 'string' ? meta.releaseAt : null;
  return nested || direct;
}

function mergeMeta(payload: any, releaseAtIso: string, releasedAtIso: string) {
  const base = typeof payload === 'object' && payload !== null ? { ...payload } : {};
  const metaBase = typeof base.meta === 'object' && base.meta !== null ? { ...base.meta } : {};
  const managerBase = typeof metaBase.manager === 'object' && metaBase.manager !== null ? { ...metaBase.manager } : {};

  metaBase.releaseAt = releaseAtIso;
  metaBase.releasedAt = releasedAtIso;
  metaBase.status = 'released';
  metaBase.manager = {
    ...managerBase,
    status: 'released',
    releaseAt: releaseAtIso,
    releasedAt: releasedAtIso,
  };

  return { ...base, meta: metaBase };
}

export async function POST(_req: Request, context: { params: Promise<Params> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = (session.user as any).id as string;

  const doc = await prisma.document.findFirst({ where: { id, userId } });
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!['cv', 'resume'].includes(doc.docType)) {
    return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });
  }

  const payload = (doc.data as any) ?? {};
  const releaseAtIso = extractReleaseAt(payload);

  if (!releaseAtIso) {
    if (doc.status === 'Ready') {
      return NextResponse.json({ document: doc, released: true });
    }
    return NextResponse.json({ error: 'No release scheduled' }, { status: 400 });
  }

  const releaseAt = new Date(releaseAtIso);
  if (Number.isNaN(releaseAt.getTime())) {
    return NextResponse.json({ error: 'Invalid release time' }, { status: 400 });
  }

  const now = new Date();
  if (now < releaseAt) {
    return NextResponse.json({ pending: true, releaseAt: releaseAt.toISOString() }, { status: 202 });
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      status: 'Ready',
      format: 'pdf',
      data: mergeMeta(payload, releaseAt.toISOString(), now.toISOString()) as any,
    },
  });

  return NextResponse.json({ document: updated, released: true });
}
