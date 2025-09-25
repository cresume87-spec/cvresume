import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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

  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const origin = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
  const url = `${origin}/print-resume/${id}`;

  const isLocal = process.env.NODE_ENV === 'development';
  const executablePath = isLocal ? undefined : await chromium.executablePath();

  const browser = await puppeteer.launch({
    args: isLocal ? [] : chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: 30000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
      preferCSSPageSize: true,
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
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  } finally {
    try { await browser.close(); } catch {}
  }
}
