import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About — Skeleton',
  description: 'MOCK: Neutral, customizable document tool overview.',
  keywords: 'about, skeleton, document, pdf, email',
  openGraph: { title: 'About — Skeleton', description: 'MOCK: Neutral, customizable document tool overview.', type: 'website' },
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Skeleton",
        "url": "https://example.com",
        "description": "MOCK: Neutral document tool",
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Skeleton",
        "url": "https://example.com",
        "description": "MOCK: Neutral document tool",
      }) }} />
      <AboutPageClient />
    </>
  );
}
