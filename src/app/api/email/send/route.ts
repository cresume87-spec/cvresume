import { authOptions } from '@/lib/auth';
import { getAppOrigin } from '@/lib/appUrl';
import { getDefaultEmailFrom, getResendClient } from '@/lib/emailClient';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email: toEmail, documentId } = await req.json();
    if (!toEmail || !documentId) {
      return NextResponse.json(
        { message: 'Recipient email and Document ID are required' },
        { status: 400 },
      );
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, userId: session.user.id },
      include: { user: { include: { company: true } } },
    });
    if (!doc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    const printUrl = `${getAppOrigin()}/print/${doc.id}`;

    const isLocal = process.env.NODE_ENV === 'development';
    const execPath = isLocal ? undefined : await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
      executablePath: execPath,
      headless: chromium.headless,
    });

    let pdfBuffer: Buffer;
    try {
      const page = await browser.newPage();
      await page.goto(printUrl, {
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000,
      });
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
        preferCSSPageSize: true,
      });
    } finally {
      try {
        await browser.close();
      } catch {}
    }

    const resend = getResendClient();
    if (!resend) {
      console.error('Resend API key is missing.');
      return NextResponse.json(
        { message: 'Email service is not configured.' },
        { status: 503 },
      );
    }

    await resend.emails.send({
      from: getDefaultEmailFrom('CareerZen'),
      to: toEmail,
      subject: `${doc.title} from ${doc.user?.company?.name || 'CareerZen'}`,
      html: '<p>Please find your document attached.</p>',
      attachments: [{ filename: `${doc.title || 'Document'}.pdf`, content: pdfBuffer }],
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('[EMAIL_SEND_ERROR]', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
