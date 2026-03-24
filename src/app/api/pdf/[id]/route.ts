import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAppOrigin } from '@/lib/appUrl';
import { renderPdfFromAppRoute } from '@/lib/serverPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pdfBuffer = await renderPdfFromAppRoute({
      label: 'document-pdf-download',
      url: `${getAppOrigin()}/print/${id}`,
    });

    const body = new Uint8Array(pdfBuffer);
    const fileName = `document-${id || 'document'}.pdf`;

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[PDF_API_ERROR]', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to render PDF',
        details: error?.stack || 'No stack trace available',
      },
      { status: 500 },
    );
  }
}
