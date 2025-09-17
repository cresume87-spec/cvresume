import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// List documents for current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const docs = await prisma.document.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ documents: docs });
}

// Create a document and charge tokens (configurable, default 10)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => ({}));
  const title = (body.title as string) || 'Untitled Document';
  const data = typeof body.data === 'object' ? body.data : {};
  const charge = Number(process.env.TOKENS_PER_DOCUMENT || 10);

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.tokenBalance < charge) return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });

    const doc = await tx.document.create({ data: { userId, title, data: data as any } });

    const newBalance = user.tokenBalance - charge;
    await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
    await tx.ledgerEntry.create({
      data: {
        userId,
        type: 'Document',
        delta: -charge,
        balanceAfter: newBalance,
      },
    });

    return NextResponse.json({ document: doc, tokenBalance: newBalance });
  });
}



