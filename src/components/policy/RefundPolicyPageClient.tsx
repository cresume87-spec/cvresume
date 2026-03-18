'use client';

import PolicyPage from '@/components/policy/PolicyPage';
import { usePreferredCurrency } from '@/lib/currencyPreference';
import { buildRefundSections } from '@/lib/policyContent';

export default function RefundPolicyPageClient() {
  const [currency] = usePreferredCurrency();

  return (
    <PolicyPage
      title="Refund & Cancellation Policy"
      sections={buildRefundSections(currency)}
      effectiveDate="01.09.2025"
      lastUpdated="17.03.2026"
      version="v1.0.7"
      helpEmail="info@careerzen.co.uk"
      showRegionToggle={false}
    />
  );
}
