export type InvoiceSellerDetails = {
  tradingName: string;
  legalName: string;
  companyNumber: string;
  vatNumber: string | null;
  address: string;
  phone: string | null;
  billingEmail: string;
};

const DEFAULT_INVOICE_SELLER: InvoiceSellerDetails = {
  tradingName: 'CareerZen',
  legalName: 'EVERFINA LTD',
  companyNumber: '15645711',
  vatNumber: null,
  address: '20 Wenlock Road, London, England, N1 7GU',
  phone: '+44 7782 334922',
  billingEmail: 'info@careerzen.co.uk',
};

function readInvoiceEnv(name: string, fallback: string | null): string | null {
  const value = process.env[name]?.trim();
  if (value) {
    return value;
  }

  return fallback;
}

export function getInvoiceSellerDetails(): InvoiceSellerDetails {
  return {
    tradingName: readInvoiceEnv('COMPANY_TRADING_NAME', DEFAULT_INVOICE_SELLER.tradingName) || 'CareerZen',
    legalName: readInvoiceEnv('COMPANY_LEGAL_NAME', DEFAULT_INVOICE_SELLER.legalName) || DEFAULT_INVOICE_SELLER.legalName,
    companyNumber:
      readInvoiceEnv('COMPANY_NUMBER', DEFAULT_INVOICE_SELLER.companyNumber) || DEFAULT_INVOICE_SELLER.companyNumber,
    vatNumber: readInvoiceEnv('COMPANY_VAT_NUMBER', DEFAULT_INVOICE_SELLER.vatNumber),
    address: readInvoiceEnv('COMPANY_ADDRESS', DEFAULT_INVOICE_SELLER.address) || DEFAULT_INVOICE_SELLER.address,
    phone: readInvoiceEnv('COMPANY_PHONE', DEFAULT_INVOICE_SELLER.phone),
    billingEmail:
      readInvoiceEnv('COMPANY_BILLING_EMAIL', DEFAULT_INVOICE_SELLER.billingEmail) ||
      process.env.EMAIL_FROM?.trim() ||
      DEFAULT_INVOICE_SELLER.billingEmail,
  };
}
