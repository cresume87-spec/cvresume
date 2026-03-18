import type { Currency } from '@prisma/client';
import { OrderConfirmationEmail } from '@/components/emails/OrderConfirmationEmail';
import { getAbsoluteAppUrl } from '@/lib/appUrl';
import { getDefaultEmailFrom, getResendClient } from '@/lib/emailClient';
import { renderOrderInvoicePdfBuffer, type OrderInvoiceData } from '@/lib/orderInvoice';

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

  const pdfBuffer = await renderOrderInvoicePdfBuffer(payload);
  const amountLabel = formatMoney(payload.amount, payload.currency);

  const { error } = await resend.emails.send({
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
}
