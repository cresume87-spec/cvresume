import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Refund & Cancellation Policy - Skeleton',
  description: 'MOCK: How refunds and cancellations work.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `MOCK: This policy explains how refunds and cancellations work for this Service.
MOCK: We sell usage credits (“Tokens”) via one-off top-ups. Tokens are not money.

MOCK: We aim to resolve billing issues quickly and fairly.` },

  { id: 'trials', title: 'Trials & Renewals', body: `MOCK: No subscriptions or auto‑renewals. Purchases are one‑off top‑ups.` },

  { id: 'refunds', title: 'Refunds — General rules', body: `MOCK: Unused tokens refundable within 14 days. Partially used — prorated or not refundable (policy-dependent). Spent tokens are non-refundable.` },

  { id: 'request', title: 'How to request', body: `MOCK: Email info@mail.com with your top‑up date, amount, currency, and reason. We usually reply within 1 business day.` },

  { id: 'processing', title: 'Processing times', body: `MOCK: Approved refunds go to the original payment method and typically appear within 5–10 business days.` },

  { id: 'fraud', title: 'Fraud, chargebacks & abuse', body: `MOCK: We may investigate unusual activity and refuse/limit refunds where we suspect abuse or fraud.` },

  { id: 'vat', title: 'VAT', body: `MOCK: Refunds include VAT where applicable; partial refunds adjust VAT proportionally.` },

  { id: 'eu_rights', title: 'EU/UK Consumer Rights', body: `MOCK: Digital content may affect withdrawal rights (14 days) unless you consent to immediate supply. Your statutory rights remain unaffected.` },

  { id: 'contact', title: 'Contact', body: `MOCK: Email info@mail.com — we reply within one business day.` },
];

export default function RefundPage() {
  return (
    <PolicyPage title="Refund & Cancellation Policy" sections={sections} />
  );
}
