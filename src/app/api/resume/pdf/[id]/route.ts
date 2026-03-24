import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppOrigin } from "@/lib/appUrl";
import { renderPdfFromAppRoute } from "@/lib/serverPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id }, select: { userId: true, docType: true, title: true } });
  if (!doc || doc.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!['cv', 'resume'].includes(doc.docType)) return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });

  const url = `${getAppOrigin()}/print-resume/${id}`;

  try {
    const pdfBuffer = await renderPdfFromAppRoute({
      label: 'resume-pdf-download',
      url,
    });

    const body = new Uint8Array(pdfBuffer);
    const safeTitle = (doc.title || `${doc.docType}-${id}`).replace(/[^a-z0-9\- ]/gi, '_').slice(0, 60) || 'resume';
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[RESUME_PDF_ERROR]', err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to generate PDF',
      },
      { status: 500 },
    );
  }
}
