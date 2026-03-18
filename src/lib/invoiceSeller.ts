export type InvoiceSellerDetails = {
  tradingName: string;
  legalName: string;
  companyNumber: string;
  vatNumber: string | null;
  address: string;
  phone: string | null;
  billingEmail: string;
};

function readRequiredInvoiceEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required invoice configuration: ${name}`);
  }

  return value;
}

export function getInvoiceSellerDetails(): InvoiceSellerDetails {
  return {
    tradingName: process.env.COMPANY_TRADING_NAME?.trim() || 'CareerZen',
    legalName: readRequiredInvoiceEnv('COMPANY_LEGAL_NAME'),
    companyNumber: readRequiredInvoiceEnv('COMPANY_NUMBER'),
    vatNumber: process.env.COMPANY_VAT_NUMBER?.trim() || null,
    address: readRequiredInvoiceEnv('COMPANY_ADDRESS'),
    phone: process.env.COMPANY_PHONE?.trim() || null,
    billingEmail:
      process.env.COMPANY_BILLING_EMAIL?.trim() ||
      process.env.EMAIL_FROM?.trim() ||
      'info@careerzen.co.uk',
  };
}
