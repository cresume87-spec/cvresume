import { Buffer } from 'node:buffer';
import type { Currency } from '@prisma/client';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { getInvoiceSellerDetails } from '@/lib/invoiceSeller';

export const ORDER_INVOICE_RENDERER_VERSION = '2026-03-24-r4-pdflib';

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

type DrawTextBlockOptions = {
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  size: number;
  maxWidth: number;
  color?: ReturnType<typeof rgb>;
  lineHeight?: number;
};

const CURRENCY_LOCALE: Record<Currency, string> = {
  GBP: 'en-GB',
  EUR: 'en-IE',
  USD: 'en-US',
};

const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 40,
  topY: 800,
  footerMinY: 72,
};

const COLORS = {
  primary: rgb(20 / 255, 33 / 255, 61 / 255),
  muted: rgb(92 / 255, 103 / 255, 125 / 255),
  border: rgb(217 / 255, 226 / 255, 236 / 255),
  headerFill: rgb(237 / 255, 242 / 255, 247 / 255),
  white: rgb(1, 1, 1),
};

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

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const trimmed = text.trim();
  if (!trimmed) {
    return [''];
  }

  const words = trimmed.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
      continue;
    }

    let chunk = '';
    for (const char of word) {
      const chunkCandidate = `${chunk}${char}`;
      if (font.widthOfTextAtSize(chunkCandidate, size) <= maxWidth) {
        chunk = chunkCandidate;
      } else {
        lines.push(chunk);
        chunk = char;
      }
    }
    currentLine = chunk;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawTextBlock({
  page,
  font,
  text,
  x,
  y,
  size,
  maxWidth,
  color = COLORS.primary,
  lineHeight = size * 1.45,
}: DrawTextBlockOptions) {
  const lines = wrapText(text, font, size, maxWidth);
  let cursorY = y;

  for (const line of lines) {
    page.drawText(line, {
      x,
      y: cursorY,
      size,
      font,
      color,
    });
    cursorY -= lineHeight;
  }

  return cursorY;
}

function drawLabelValueRow(
  page: PDFPage,
  label: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  fonts: { regular: PDFFont; bold: PDFFont },
  fillColor?: ReturnType<typeof rgb>,
  textColor = COLORS.primary,
) {
  if (fillColor) {
    page.drawRectangle({
      x: left,
      y: top - height,
      width,
      height,
      color: fillColor,
    });
  }

  page.drawRectangle({
    x: left,
    y: top - height,
    width,
    height,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  const baselineY = top - 18;
  page.drawText(label, {
    x: left + 12,
    y: baselineY,
    size: 10,
    font: fonts.regular,
    color: textColor,
  });

  const valueWidth = fonts.bold.widthOfTextAtSize(value, 10);
  page.drawText(value, {
    x: left + width - 12 - valueWidth,
    y: baselineY,
    size: 10,
    font: fonts.bold,
    color: textColor,
  });
}

async function buildOrderInvoicePdf(data: OrderInvoiceData) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const seller = getInvoiceSellerDetails();

  const invoiceTitle = 'Invoice';
  const invoiceNumberLabel = `Invoice No: ${data.invoiceNumber}`;
  const issueDateLabel = `Issue date: ${formatDate(data.issueDate)}`;
  const paidDateLabel = `Paid date: ${formatDate(data.paidDate)}`;
  const tradingNameLabel = `Trading name: ${seller.tradingName}`;
  const companyNumberLabel = `Company No: ${seller.companyNumber}`;
  const vatNumberLabel = seller.vatNumber ? `VAT No: ${seller.vatNumber}` : null;
  const merchantReferenceLabel = `Merchant reference: ${data.orderMerchantId}`;
  const gatewayReferenceLabel = data.orderSystemId
    ? `Gateway reference: ${data.orderSystemId}`
    : null;
  const totalPaidLabel = formatMoney(data.amount, data.currency);
  const footerText =
    'Thank you for your purchase. This invoice confirms successful payment for your CareerZen order. All displayed prices are VAT-inclusive where applicable.';
  const fonts = { regular, bold };

  const contentWidth = PAGE.width - PAGE.marginX * 2;
  const leftColumnWidth = 300;
  const rightColumnWidth = 195;
  const rightColumnX = PAGE.width - PAGE.marginX - rightColumnWidth;
  const sectionWidth = contentWidth;

  let leftY = PAGE.topY;
  page.drawText(invoiceTitle, {
    x: PAGE.marginX,
    y: leftY,
    size: 24,
    font: bold,
    color: COLORS.primary,
  });
  leftY -= 30;

  for (const line of [
    seller.tradingName,
    invoiceNumberLabel,
    issueDateLabel,
    paidDateLabel,
    'Status: Paid',
  ]) {
    page.drawText(line, {
      x: PAGE.marginX,
      y: leftY,
      size: 10,
      font: regular,
      color: COLORS.muted,
    });
    leftY -= 14;
  }

  let rightY = PAGE.topY + 2;
  for (const [index, line] of [
    seller.legalName,
    tradingNameLabel,
    companyNumberLabel,
    vatNumberLabel,
    seller.address,
    seller.phone ?? null,
    seller.billingEmail,
  ].entries()) {
    if (!line) {
      continue;
    }

    rightY = drawTextBlock({
      page,
      font: index === 0 ? bold : regular,
      text: line,
      x: rightColumnX,
      y: rightY,
      size: 11,
      maxWidth: rightColumnWidth,
      color: index === 0 ? COLORS.primary : COLORS.primary,
      lineHeight: 14,
    });
  }

  let cursorY = Math.min(leftY, rightY) - 16;

  page.drawText('BILL TO', {
    x: PAGE.marginX,
    y: cursorY,
    size: 10,
    font: regular,
    color: COLORS.muted,
  });
  cursorY -= 18;
  cursorY = drawTextBlock({
    page,
    font: bold,
    text: data.customerName,
    x: PAGE.marginX,
    y: cursorY,
    size: 11,
    maxWidth: sectionWidth,
  });
  cursorY = drawTextBlock({
    page,
    font: regular,
    text: data.customerEmail,
    x: PAGE.marginX,
    y: cursorY,
    size: 11,
    maxWidth: sectionWidth,
  });

  cursorY -= 10;
  page.drawText('PAYMENT REFERENCE', {
    x: PAGE.marginX,
    y: cursorY,
    size: 10,
    font: regular,
    color: COLORS.muted,
  });
  cursorY -= 18;
  cursorY = drawTextBlock({
    page,
    font: regular,
    text: merchantReferenceLabel,
    x: PAGE.marginX,
    y: cursorY,
    size: 11,
    maxWidth: sectionWidth,
  });

  if (gatewayReferenceLabel) {
    cursorY = drawTextBlock({
      page,
      font: regular,
      text: gatewayReferenceLabel,
      x: PAGE.marginX,
      y: cursorY,
      size: 11,
      maxWidth: sectionWidth,
    });
  }

  cursorY -= 14;

  const tableLeft = PAGE.marginX;
  const tableTop = cursorY;
  const descriptionWidth = 240;
  const qtyWidth = 80;
  const unitWidth = 95;
  const totalWidth = contentWidth - descriptionWidth - qtyWidth - unitWidth;
  const headerHeight = 30;
  const descriptionLines = wrapText(buildDescription(data), regular, 10, descriptionWidth - 20);
  const rowHeight = Math.max(38, descriptionLines.length * 14 + 12);

  page.drawRectangle({
    x: tableLeft,
    y: tableTop - headerHeight,
    width: contentWidth,
    height: headerHeight,
    color: COLORS.headerFill,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  const columns = [
    { label: 'Description', width: descriptionWidth, align: 'left' as const },
    { label: 'Qty', width: qtyWidth, align: 'right' as const },
    { label: 'Unit', width: unitWidth, align: 'right' as const },
    { label: 'Total', width: totalWidth, align: 'right' as const },
  ];

  let columnX = tableLeft;
  for (const column of columns) {
    page.drawLine({
      start: { x: columnX, y: tableTop - headerHeight },
      end: { x: columnX, y: tableTop - headerHeight - rowHeight },
      thickness: 1,
      color: COLORS.border,
    });

    const labelWidth = bold.widthOfTextAtSize(column.label, 10);
    page.drawText(column.label, {
      x:
        column.align === 'left'
          ? columnX + 10
          : columnX + column.width - 10 - labelWidth,
      y: tableTop - 19,
      size: 10,
      font: bold,
      color: COLORS.primary,
    });

    columnX += column.width;
  }

  page.drawLine({
    start: { x: tableLeft + contentWidth, y: tableTop - headerHeight },
    end: { x: tableLeft + contentWidth, y: tableTop - headerHeight - rowHeight },
    thickness: 1,
    color: COLORS.border,
  });

  page.drawRectangle({
    x: tableLeft,
    y: tableTop - headerHeight - rowHeight,
    width: contentWidth,
    height: rowHeight,
    borderColor: COLORS.border,
    borderWidth: 1,
  });

  let rowTextY = tableTop - headerHeight - 16;
  for (const line of descriptionLines) {
    page.drawText(line, {
      x: tableLeft + 10,
      y: rowTextY,
      size: 10,
      font: regular,
      color: COLORS.primary,
    });
    rowTextY -= 14;
  }

  const qtyText = '1';
  const qtyTextWidth = regular.widthOfTextAtSize(qtyText, 10);
  page.drawText(qtyText, {
    x: tableLeft + descriptionWidth + qtyWidth - 10 - qtyTextWidth,
    y: tableTop - headerHeight - 16,
    size: 10,
    font: regular,
    color: COLORS.primary,
  });

  const unitTextWidth = regular.widthOfTextAtSize(totalPaidLabel, 10);
  page.drawText(totalPaidLabel, {
    x: tableLeft + descriptionWidth + qtyWidth + unitWidth - 10 - unitTextWidth,
    y: tableTop - headerHeight - 16,
    size: 10,
    font: regular,
    color: COLORS.primary,
  });

  const totalTextWidth = regular.widthOfTextAtSize(totalPaidLabel, 10);
  page.drawText(totalPaidLabel, {
    x: tableLeft + contentWidth - 10 - totalTextWidth,
    y: tableTop - headerHeight - 16,
    size: 10,
    font: regular,
    color: COLORS.primary,
  });

  const totalsTop = tableTop - headerHeight - rowHeight - 18;
  const totalsLeft = PAGE.width - PAGE.marginX - 240;
  const totalsWidth = 240;
  const totalRowHeight = 32;

  drawLabelValueRow(page, 'Subtotal', totalPaidLabel, totalsLeft, totalsTop, totalsWidth, totalRowHeight, fonts);
  drawLabelValueRow(
    page,
    'VAT included',
    'Included in total',
    totalsLeft,
    totalsTop - totalRowHeight + 1,
    totalsWidth,
    totalRowHeight,
    fonts,
  );
  drawLabelValueRow(
    page,
    'Total paid',
    totalPaidLabel,
    totalsLeft,
    totalsTop - totalRowHeight * 2 + 2,
    totalsWidth,
    totalRowHeight,
    fonts,
    COLORS.primary,
    COLORS.white,
  );

  const footerY = Math.max(
    PAGE.footerMinY,
    totalsTop - totalRowHeight * 3 - 36,
  );
  drawTextBlock({
    page,
    font: regular,
    text: footerText,
    x: PAGE.marginX,
    y: footerY,
    size: 10,
    maxWidth: contentWidth,
    color: COLORS.muted,
    lineHeight: 13,
  });

  return pdfDoc;
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
    const pdfDoc = await buildOrderInvoicePdf(data);
    const bytes = await pdfDoc.save();
    const buffer = Buffer.from(bytes);
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
