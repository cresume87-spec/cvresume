import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'Skeleton - Documents made simple',
  description: 'Neutral, customizable document generation with PDF, email, and sharing.',
  keywords: 'document, pdf, email, sharing, generator, template',
  authors: [{ name: 'Skeleton' }],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Skeleton - Documents made simple',
    description: 'Neutral, customizable document generation with PDF, email, and sharing.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skeleton - Documents made simple',
    description: 'Neutral, customizable document generation with PDF, email, and sharing.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
