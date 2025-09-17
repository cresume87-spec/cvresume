import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Terms of Service - Skeleton',
  description: 'MOCK: Your agreement with us to use the service.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `MOCK: These Terms form a binding agreement between you and the provider of this Service. By using the Service, you accept these Terms and our Privacy/Cookie Policies.` },
  { id: 'eligibility', title: 'Eligibility & Account', body: `MOCK: You must be able to enter into a contract and keep your account secure. We may request verification where needed.` },
  { id: 'use', title: 'Acceptable Use', body: `MOCK: Do not break the law, infringe IP, violate privacy, or disrupt the Service. We may remove content or suspend access to protect users and comply with law.` },
  { id: 'billing', title: 'Billing & Taxes', body: `MOCK: Tokens are one‑off top‑ups. Payments are processed by providers; we do not store card numbers. Prices may exclude taxes; VAT is applied per country/status. See Refund Policy for details.` },
  { id: 'cancellation', title: 'Cancellation & Termination', body: `MOCK: You can stop using the Service or delete your account. We may suspend/terminate for breach, legal risk, or security reasons.` },
  { id: 'liability', title: 'Limitation of Liability', body: `MOCK: The Service is provided “as is” within lawful limits. We are not liable for indirect damages; liability is capped to a reasonable amount where permitted.` },
  { id: 'law', title: 'Governing Law', body: `MOCK: UK view — England & Wales; EU view — your Member State. Mandatory consumer rights remain unaffected.` },
  { id: 'contact', title: 'Contact', body: `MOCK: Email info@mail.com` },
  { id: 'optional', title: 'Optional clauses', body: `MOCK: We may update Terms with notice. You keep rights in your content; we have a limited license to host/process it for the Service.` },
];

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" sections={sections} />
  );
}
