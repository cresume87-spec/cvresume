import PricingClient from './pricingClient';

export const metadata = {
  title: 'Top-Up - Invoicerly',
  description: 'Top up tokens with VAT included in displayed prices.',
};

export default function PricingPage() {
  return <PricingClient />;
}
