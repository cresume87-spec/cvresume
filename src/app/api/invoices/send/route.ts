import { authOptions } from '@/lib/auth';
import { getAppOrigin } from '@/lib/appUrl';
import { getDefaultEmailFrom, getResendClient } from '@/lib/emailClient';
import { prisma } from '@/lib/prisma';
import { renderPdfFromAppRoute } from '@/lib/serverPdf';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('[DOC_SEND] Starting email send process');
    console.log(`[DOC_SEND] RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
    console.log(`[DOC_SEND] EMAIL_FROM: ${process.env.EMAIL_FROM}`);

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
      return NextResponse.json(
        { message: 'Document not found' },
        { status: 404 },
      );
    }

    console.log(`[DOC_SEND] Generating PDF for document ${doc.id}`);

    const printUrl = `${getAppOrigin()}/print/${doc.id}`;
    console.log(`[DOC_SEND] Print URL: ${printUrl}`);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderPdfFromAppRoute({
        label: 'invoice-email-attachment',
        url: printUrl,
      });
      console.log(`[DOC_SEND] PDF generated, size: ${pdfBuffer.length} bytes`);
    } catch (pdfError) {
      console.error('[DOC_SEND] PDF generation error:', pdfError);
      throw new Error(
        `Failed to generate PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`,
      );
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ message: 'Email service is not configured.' }, { status: 503 });
    }

    await resend.emails.send({
      from: getDefaultEmailFrom('CareerZen'),
      to: toEmail,
      subject: `${doc.title} from ${doc.user?.company?.name || 'CareerZen'}`,
      html: '<p>Please find your document attached.</p>',
      attachments: [
        {
          filename: `${doc.title || 'Document'}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('[DOC_SEND_ERROR]', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
