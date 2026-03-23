import { renderToBuffer, Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Currency } from '@prisma/client';
import { getInvoiceSellerDetails } from '@/lib/invoiceSeller';

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

  return (
    <Document title={`Invoice ${data.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View style={styles.leftColumn}>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.subtitle}>{seller.tradingName}</Text>
            <Text style={styles.subtitle}>Invoice No: {data.invoiceNumber}</Text>
            <Text style={styles.subtitle}>Issue date: {formatDate(data.issueDate)}</Text>
            <Text style={styles.subtitle}>Paid date: {formatDate(data.paidDate)}</Text>
            <Text style={styles.subtitle}>Status: Paid</Text>
          </View>

          <View style={styles.rightColumn}>
            <Text style={[styles.text, styles.strong]}>{seller.legalName}</Text>
            <Text style={styles.text}>Trading name: {seller.tradingName}</Text>
            <Text style={styles.text}>Company No: {seller.companyNumber}</Text>
            {seller.vatNumber ? <Text style={styles.text}>VAT No: {seller.vatNumber}</Text> : null}
            <Text style={styles.text}>{seller.address}</Text>
            {seller.phone ? <Text style={styles.text}>{seller.phone}</Text> : null}
            <Text style={styles.text}>{seller.billingEmail}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={[styles.text, styles.strong]}>{data.customerName}</Text>
          <Text style={styles.text}>{data.customerEmail}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Reference</Text>
          <Text style={styles.text}>Merchant reference: {data.orderMerchantId}</Text>
          {data.orderSystemId ? (
            <Text style={styles.text}>Gateway reference: {data.orderSystemId}</Text>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellWide, styles.strong]}>Description</Text>
            <Text style={[styles.cell, styles.cellMedium, styles.strong]}>Qty</Text>
            <Text style={[styles.cell, styles.cellNarrow, styles.strong]}>Unit</Text>
            <Text style={[styles.cell, styles.cellNarrow, styles.strong]}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.cellWide]}>{lineDescription}</Text>
            <Text style={[styles.cell, styles.cellMedium]}>1</Text>
            <Text style={[styles.cell, styles.cellNarrow]}>{formatMoney(data.amount, data.currency)}</Text>
            <Text style={[styles.cell, styles.cellNarrow]}>{formatMoney(data.amount, data.currency)}</Text>
          </View>
        </View>

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(data.amount, data.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>VAT included</Text>
            <Text>Included in total</Text>
          </View>
          <View style={[styles.totalRow, styles.totalFinal]}>
            <Text>Total paid</Text>
            <Text>{formatMoney(data.amount, data.currency)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Thank you for your purchase. This invoice confirms successful payment for your CareerZen order.
          All displayed prices are VAT-inclusive where applicable.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderOrderInvoicePdfBuffer(data: OrderInvoiceData) {
  return renderToBuffer(buildOrderInvoiceDocument(data));
}
