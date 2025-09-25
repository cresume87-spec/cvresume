import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// List documents for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = (session.user as any).id as string;
    const docs = await prisma.document.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ documents: docs });
  } catch (err) {
    console.error('[DOCUMENTS_GET_ERROR]', err);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}

// Create a document and charge tokens (configurable, default 10)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'Untitled Document';
  const data = typeof body.data === 'object' && body.data !== null ? body.data : {};
  const actionRaw = typeof body.action === 'string' ? body.action.toLowerCase() : 'draft';
  const allowedActions = new Set(['draft', 'export-pdf', 'export-docx']);
  const action = allowedActions.has(actionRaw) ? actionRaw : 'draft';
  const draftCharge = Number(process.env.TOKENS_PER_DOCUMENT || 10);
  const exportCharge = Number(process.env.TOKENS_PER_EXPORT || 15);
  const chargeMap: Record<string, number> = {
    draft: draftCharge,
    'export-pdf': exportCharge,
    'export-docx': exportCharge,
  };
  const charge = chargeMap[action] ?? draftCharge;
  const docTypeRaw = typeof body.docType === 'string' ? body.docType.toLowerCase() : 'document';
  const docType = ['cv', 'resume', 'document'].includes(docTypeRaw) ? docTypeRaw : 'document';
  const status = action === 'draft' ? 'Draft' : 'Ready';
  const format = action === 'export-docx' ? 'docx' : action === 'export-pdf' ? 'pdf' : 'draft';

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { tokenBalance: true } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      if (user.tokenBalance < charge) return NextResponse.json({ error: 'Not enough tokens' }, { status: 400 });

      const doc = await tx.document.create({
        data: {
          userId,
          title,
          data: data as any,
          docType,
          status,
          format,
        },
      });

      const newBalance = user.tokenBalance - charge;
      await tx.user.update({ where: { id: userId }, data: { tokenBalance: newBalance } });
      await tx.ledgerEntry.create({
        data: {
          userId,
          type: action === 'draft' ? 'Document' : 'Document Export',
          delta: -charge,
          balanceAfter: newBalance,
        },
      });

      return NextResponse.json({ document: doc, tokenBalance: newBalance, charge, action });
    });
  } catch (err) {
    console.error('[DOCUMENTS_POST_ERROR]', err);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}


