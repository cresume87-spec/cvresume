'use client';

import PolicyPage from '@/components/policy/PolicyPage';
import { usePreferredCurrency } from '@/lib/currencyPreference';
import { buildTermsSections } from '@/lib/policyContent';

export default function TermsPolicyPageClient() {
  const [currency] = usePreferredCurrency();

  return (
    <PolicyPage
      title="Terms & Conditions"
      sections={buildTermsSections(currency)}
      effectiveDate="01.09.2025"
      lastUpdated="17.03.2026"
      version="v1.0.7"
      helpEmail="info@careerzen.co.uk"
      showRegionToggle={false}
    />
  );
}
