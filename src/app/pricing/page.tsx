import PricingClient from './pricingClient';

export const metadata = {
  title: 'Top-Up - Invoicerly',
  description: 'Top up tokens with transparent VAT estimation (UK/EU).',
};

export default function PricingPage() {
  return <PricingClient />;
}
