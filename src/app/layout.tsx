import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-manrope', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'CVBuilder - Professional CV & Resume Creator',
  description: 'Create professional CVs and resumes in minutes. Choose from ATS-friendly templates, export to PDF or DOCX. Get hired faster with our modern resume builder.',
  keywords: 'cv, resume, cv builder, resume creator, ats friendly, professional cv, job application, career',
  authors: [{ name: 'CVBuilder' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
  },
  openGraph: {
    title: 'CVBuilder - Professional CV & Resume Creator',
    description: 'Create professional CVs and resumes in minutes. Choose from ATS-friendly templates, export to PDF or DOCX. Get hired faster with our modern resume builder.',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CVBuilder - Professional CV & Resume Creator',
    description: 'Create professional CVs and resumes in minutes. Choose from ATS-friendly templates, export to PDF or DOCX. Get hired faster with our modern resume builder.',
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
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
