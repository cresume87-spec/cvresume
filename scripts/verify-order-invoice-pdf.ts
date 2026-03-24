import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Currency } from '@prisma/client';
import {
  ORDER_INVOICE_RENDERER_VERSION,
  renderOrderInvoicePdfBuffer,
  type OrderInvoiceData,
} from '../src/lib/orderInvoice';

const FIXTURE_CURRENCY: Currency = 'GBP';

function createFixture(): OrderInvoiceData {
  const now = new Date('2026-03-24T12:00:00.000Z');

  return {
    invoiceNumber: 'CZ-20260324-SMOKETST',
    issueDate: now,
    paidDate: now,
    customerName: 'Smoke Test Customer',
    customerEmail: 'smoke-test@careerzen.co.uk',
    orderMerchantId: 'order_smoke_test_20260324',
    orderSystemId: 'system_smoke_test',
    description: 'CareerZen token top-up (500 tokens)',
    tokens: 500,
    amount: 5,
    currency: FIXTURE_CURRENCY,
  };
}

async function main() {
  const fixture = createFixture();
  const outputDir = path.join(process.cwd(), 'tmp');
  const outputFile = path.join(outputDir, 'order-invoice-smoke-test.pdf');

  console.log('[ORDER_INVOICE_SMOKE_TEST_START]', {
    rendererVersion: ORDER_INVOICE_RENDERER_VERSION,
    outputFile,
    invoiceNumber: fixture.invoiceNumber,
    orderMerchantId: fixture.orderMerchantId,
  });

  const buffer = await renderOrderInvoicePdfBuffer(fixture);

  if (!buffer.length) {
    throw new Error('Order invoice smoke test produced an empty PDF buffer.');
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputFile, buffer);

  console.log('[ORDER_INVOICE_SMOKE_TEST_SUCCESS]', {
    rendererVersion: ORDER_INVOICE_RENDERER_VERSION,
    outputFile,
    size: buffer.length,
  });
}

main().catch((error) => {
  console.error('[ORDER_INVOICE_SMOKE_TEST_ERROR]');
  console.error(error);
  process.exitCode = 1;
});
