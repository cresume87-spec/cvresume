import React from 'react';
import { renderToBuffer, Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Currency } from '@prisma/client';
import { getInvoiceSellerDetails } from '@/lib/invoiceSeller';

export const ORDER_INVOICE_RENDERER_VERSION = '2026-03-24-r3';

export type OrderInvoiceData = {
  invoiceNumber: string;
  issueDate: Date;
  paidDate: Date;
  customerName: string;
  customerEmail: string;
  orderMerchantId: string;
  orderSystemId: string | null;
  description: string;
  tokens: number;
  amount: number;
  currency: Currency;
};

const CURRENCY_LOCALE: Record<Currency, string> = {
  GBP: 'en-GB',
  EUR: 'en-IE',
  USD: 'en-US',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#14213d',
    backgroundColor: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    width: '56%',
    paddingRight: 20,
  },
  rightColumn: {
    width: '44%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    color: '#5c677d',
    marginBottom: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#5c677d',
    marginBottom: 8,
  },
  text: {
    marginBottom: 4,
    lineHeight: 1.45,
  },
  strong: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderStyle: 'solid',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#edf2f7',
    borderBottomWidth: 1,
    borderBottomColor: '#d9e2ec',
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d9e2ec',
    borderBottomStyle: 'solid',
  },
  cell: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cellWide: {
    width: '46%',
  },
  cellMedium: {
    width: '18%',
    textAlign: 'right',
  },
  cellNarrow: {
    width: '18%',
    textAlign: 'right',
  },
  totalBox: {
    marginTop: 16,
    marginLeft: 'auto',
    width: 240,
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderStyle: 'solid',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d9e2ec',
    borderBottomStyle: 'solid',
  },
  totalFinal: {
    backgroundColor: '#14213d',
    color: '#ffffff',
  },
  footer: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d9e2ec',
    borderTopStyle: 'solid',
    fontSize: 10,
    color: '#5c677d',
    lineHeight: 1.45,
  },
});

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function buildDescription(data: OrderInvoiceData) {
  return data.description?.trim() || `CareerZen token top-up (${data.tokens} tokens)`;
}

export function buildOrderInvoiceNumber(orderId: string, createdAt: Date) {
  const datePart = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(createdAt)
    .replace(/-/g, '');

  return `CZ-${datePart}-${orderId.slice(-8).toUpperCase()}`;
}

function buildOrderInvoiceDocument(data: OrderInvoiceData) {
  const seller = getInvoiceSellerDetails();
  const lineDescription = buildDescription(data);
  const invoiceTitle = `Invoice ${data.invoiceNumber}`;
  const issueDateLabel = `Issue date: ${formatDate(data.issueDate)}`;
  const paidDateLabel = `Paid date: ${formatDate(data.paidDate)}`;
  const invoiceNumberLabel = `Invoice No: ${data.invoiceNumber}`;
  const tradingNameLabel = `Trading name: ${seller.tradingName}`;
  const companyNumberLabel = `Company No: ${seller.companyNumber}`;
  const vatNumberLabel = seller.vatNumber ? `VAT No: ${seller.vatNumber}` : null;
  const merchantReferenceLabel = `Merchant reference: ${data.orderMerchantId}`;
  const gatewayReferenceLabel = data.orderSystemId
    ? `Gateway reference: ${data.orderSystemId}`
    : null;
  const totalPaidLabel = formatMoney(data.amount, data.currency);
  const e = React.createElement;

  return e(
    Document,
    { title: invoiceTitle },
    e(
      Page,
      { size: 'A4', style: styles.page },
      e(
        View,
        { style: styles.row },
        e(
          View,
          { style: styles.leftColumn },
          e(Text, { style: styles.title }, 'Invoice'),
          e(Text, { style: styles.subtitle }, seller.tradingName),
          e(Text, { style: styles.subtitle }, invoiceNumberLabel),
          e(Text, { style: styles.subtitle }, issueDateLabel),
          e(Text, { style: styles.subtitle }, paidDateLabel),
          e(Text, { style: styles.subtitle }, 'Status: Paid'),
        ),
        e(
          View,
          { style: styles.rightColumn },
          e(Text, { style: [styles.text, styles.strong] }, seller.legalName),
          e(Text, { style: styles.text }, tradingNameLabel),
          e(Text, { style: styles.text }, companyNumberLabel),
          vatNumberLabel ? e(Text, { style: styles.text }, vatNumberLabel) : null,
          e(Text, { style: styles.text }, seller.address),
          seller.phone ? e(Text, { style: styles.text }, seller.phone) : null,
          e(Text, { style: styles.text }, seller.billingEmail),
        ),
      ),
      e(
        View,
        { style: styles.section },
        e(Text, { style: styles.sectionTitle }, 'Bill To'),
        e(Text, { style: [styles.text, styles.strong] }, data.customerName),
        e(Text, { style: styles.text }, data.customerEmail),
      ),
      e(
        View,
        { style: styles.section },
        e(Text, { style: styles.sectionTitle }, 'Payment Reference'),
        e(Text, { style: styles.text }, merchantReferenceLabel),
        gatewayReferenceLabel ? e(Text, { style: styles.text }, gatewayReferenceLabel) : null,
      ),
      e(
        View,
        { style: styles.table },
        e(
          View,
          { style: styles.tableHeader },
          e(Text, { style: [styles.cell, styles.cellWide, styles.strong] }, 'Description'),
          e(Text, { style: [styles.cell, styles.cellMedium, styles.strong] }, 'Qty'),
          e(Text, { style: [styles.cell, styles.cellNarrow, styles.strong] }, 'Unit'),
          e(Text, { style: [styles.cell, styles.cellNarrow, styles.strong] }, 'Total'),
        ),
        e(
          View,
          { style: styles.tableRow },
          e(Text, { style: [styles.cell, styles.cellWide] }, lineDescription),
          e(Text, { style: [styles.cell, styles.cellMedium] }, '1'),
          e(Text, { style: [styles.cell, styles.cellNarrow] }, totalPaidLabel),
          e(Text, { style: [styles.cell, styles.cellNarrow] }, totalPaidLabel),
        ),
      ),
      e(
        View,
        { style: styles.totalBox },
        e(
          View,
          { style: styles.totalRow },
          e(Text, null, 'Subtotal'),
          e(Text, null, totalPaidLabel),
        ),
        e(
          View,
          { style: styles.totalRow },
          e(Text, null, 'VAT included'),
          e(Text, null, 'Included in total'),
        ),
        e(
          View,
          { style: [styles.totalRow, styles.totalFinal] },
          e(Text, null, 'Total paid'),
          e(Text, null, totalPaidLabel),
        ),
      ),
      e(
        Text,
        { style: styles.footer },
        'Thank you for your purchase. This invoice confirms successful payment for your CareerZen order. ',
        'All displayed prices are VAT-inclusive where applicable.',
      ),
    ),
  );
}

function buildOrderInvoiceRenderDiagnostics(data: OrderInvoiceData) {
  const seller = getInvoiceSellerDetails();

  return {
    rendererVersion: ORDER_INVOICE_RENDERER_VERSION,
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    invoiceNumber: data.invoiceNumber,
    orderMerchantId: data.orderMerchantId,
    customerNameType: typeof data.customerName,
    customerEmailType: typeof data.customerEmail,
    descriptionType: typeof data.description,
    amountType: typeof data.amount,
    currencyType: typeof data.currency,
    hasOrderSystemId: Boolean(data.orderSystemId),
    hasVatNumber: Boolean(seller.vatNumber),
  };
}

export async function renderOrderInvoicePdfBuffer(data: OrderInvoiceData) {
  const diagnostics = buildOrderInvoiceRenderDiagnostics(data);
  console.log('[ORDER_INVOICE_PDF_RENDER_START]', diagnostics);

  try {
    const buffer = await renderToBuffer(buildOrderInvoiceDocument(data));
    console.log('[ORDER_INVOICE_PDF_RENDER_SUCCESS]', {
      ...diagnostics,
      size: buffer.length,
    });
    return buffer;
  } catch (error) {
    console.error('[ORDER_INVOICE_PDF_RENDER_ERROR]', diagnostics);
    throw error;
  }
}
