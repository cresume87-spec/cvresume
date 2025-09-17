import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Privacy Policy - Skeleton',
  description: 'MOCK: How we collect, use, and protect personal data.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `MOCK: This policy explains how we collect, use, and protect personal data when you use this Service.

MOCK: We do not sell personal data. We process it to provide and improve the Service.` },
  { id: 'scope', title: 'Scope & Region', body: `MOCK: This policy applies to users in the UK and EU/EEA. Transfers use appropriate safeguards.

MOCK: The Service is not intended for children under 16.` },
  { id: 'data', title: 'Data We Collect', body: `MOCK: Account data (name, email), settings, usage and device info.

MOCK: Content you submit (documents and related metadata).

MOCK: Billing/top-ups; no card numbers are stored on our servers.

MOCK: Support messages sent to info@mail.com.

MOCK: Cookies & similar tech; see Cookie Policy.` },
  { id: 'use', title: 'How We Use Data', body: `MOCK: We process data to:

• Provide the Service on your request.
• Operate & secure the Service.
• Handle billing & compliance.
• Improve features and fix issues.
• Send essential communications.
• Meet legal obligations.` },
  { id: 'rights', title: 'Your Rights', body: `MOCK: You may request access, rectification, deletion, restriction, portability, and withdraw consent where applicable.

MOCK: To exercise rights, email info@mail.com from your account email.` },
  { id: 'security', title: 'Security', body: `MOCK: We use encryption, access controls, backups, and incident response. No method is 100% secure, but we work to reduce risk.` },
  { id: 'retention', title: 'Retention', body: `MOCK: We keep data only as long as needed, then delete or anonymise it.` },
  { id: 'sharing', title: 'Sharing', body: `MOCK: We share data with service providers under contract, payment processors, advisors, and authorities where required by law.` },
  { id: 'cookies', title: 'Cookies', body: `MOCK: We use strictly necessary, preferences, analytics (consent-based), and optional marketing cookies. Manage preferences in-app and via your browser.` },
  { id: 'contact', title: 'Contact', body: `MOCK: Email info@mail.com. We reply within one business day.` },
];

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" sections={sections} />
  );
}
