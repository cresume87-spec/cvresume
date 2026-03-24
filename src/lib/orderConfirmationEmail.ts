import type { Currency } from '@prisma/client';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { getAbsoluteAppUrl } from '@/lib/appUrl';
import { getDefaultEmailFrom, getResendClient } from '@/lib/emailClient';
import {
  ORDER_INVOICE_RENDERER_VERSION,
  renderOrderInvoicePdfBuffer,
  type OrderInvoiceData,
} from '@/lib/orderInvoice';

type OrderConfirmationEmailPayload = OrderInvoiceData & {
  recipientName: string;
};

const CURRENCY_LOCALE: Record<Currency, string> = {
  GBP: 'en-GB',
  EUR: 'en-IE',
  USD: 'en-US',
};

function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildOrderConfirmationEmailText(payload: OrderConfirmationEmailPayload) {
  return [
    `Hi ${payload.recipientName},`,
    '',
    'Your CareerZen payment has been approved.',
    `Invoice number: ${payload.invoiceNumber}`,
    `Merchant reference: ${payload.orderMerchantId}`,
    `Total paid: ${formatMoney(payload.amount, payload.currency)}`,
    `Tokens credited: ${payload.tokens}`,
    '',
    `Dashboard: ${getAbsoluteAppUrl('/dashboard')}`,
    '',
    'Your invoice PDF is attached to this email.',
    'If you did not authorize this payment, contact support immediately.',
  ].join('\n');
}

export async function sendOrderConfirmationEmail(payload: OrderConfirmationEmailPayload) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error('Email service is not configured.');
  }

  const logContext = {
    rendererVersion: ORDER_INVOICE_RENDERER_VERSION,
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    invoiceNumber: payload.invoiceNumber,
    orderMerchantId: payload.orderMerchantId,
    recipient: payload.customerEmail,
  };

  console.log('[ORDER_CONFIRMATION_EMAIL_SEND_START]', logContext);

  let pdfBuffer: Buffer;

  try {
    pdfBuffer = await renderOrderInvoicePdfBuffer(payload);
  } catch (error) {
    console.error('[ORDER_CONFIRMATION_PDF_RENDER_ERROR]', logContext);
    throw error;
  }

  const amountLabel = formatMoney(payload.amount, payload.currency);

  try {
    const { data, error } = await resend.emails.send({
      from: getDefaultEmailFrom('CareerZen'),
      to: payload.customerEmail,
      subject: `CareerZen order confirmation ${payload.invoiceNumber}`,
      react: OrderConfirmationEmail({
        recipientName: payload.recipientName,
        invoiceNumber: payload.invoiceNumber,
        orderMerchantId: payload.orderMerchantId,
        amountLabel,
        tokens: payload.tokens,
        dashboardUrl: getAbsoluteAppUrl('/dashboard'),
      }),
      text: buildOrderConfirmationEmailText(payload),
      attachments: [
        {
          filename: `CareerZen-Invoice-${payload.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      throw new Error(error.message || 'Failed to send order confirmation email.');
    }

    console.log('[ORDER_CONFIRMATION_RESEND_SUCCESS]', {
      ...logContext,
      emailId: data?.id ?? null,
    });
  } catch (error) {
    console.error('[ORDER_CONFIRMATION_RESEND_ERROR]', logContext);
    throw error;
  }
}
