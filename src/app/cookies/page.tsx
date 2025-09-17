import PolicyPage from '@/components/policy/PolicyPage';
import { PolicySection } from '@/types/policy';

export const metadata = {
  title: 'Cookie Policy - Skeleton',
  description: 'MOCK: What cookies are and why we use them.',
};

const sections: PolicySection[] = [
  { id: 'intro', title: 'Introduction', body: `MOCK: This Cookie Policy explains how we use cookies and similar technologies on our website and app.
MOCK: We use cookies for core features, preferences, performance, and optional marketing.` },

  { id: 'types', title: 'Types of Cookies', body: `MOCK: We group cookies into categories. Exact names may vary.` },

  { id: 'necessary', title: '1) Strictly necessary (always on)', body: `MOCK: Required to run the Service and keep it secure.` },

  { id: 'preferences', title: '2) Preferences', body: `MOCK: Remembers your choices (language/region, UI).` },

  { id: 'analytics', title: '3) Performance & analytics (consent-based in UK/EU)', body: `MOCK: Helps improve reliability, speed, and UX. Aggregated where possible.` },

  { id: 'functionality', title: '4) Functionality', body: `MOCK: Optional features you request (may use localStorage).` },

  { id: 'marketing', title: '5) Marketing (opt-in only)', body: `MOCK: Measures campaigns and improves relevance. Only with consent.` },

  { id: 'manage', title: 'Managing Preferences', body: `MOCK: Manage choices in-app or via browser settings. Blocking necessary cookies may break sign‑in.` },

  { id: 'duration', title: 'Duration', body: `MOCK: Session cookies end with the session; persistent cookies last until expiry or deletion.` },

  { id: 'contact', title: 'Contact', body: `MOCK: Email info@mail.com — we reply within one business day.` },
];

export default function CookiesPage() {
  return (
    <PolicyPage title="Cookie Policy" sections={sections} />
  );
}
