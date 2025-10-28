'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const PRODUCT_LINKS = [
  { label: 'Create my CV', href: '/create-cv' },
  { label: 'Create my resume', href: '/create-resume' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Token Calculator', href: '/token-calculator' },
];

const HELP_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/help/faq' },
  { label: 'Getting Started', href: '/help/getting-started' },
  { label: 'Billing & Tokens', href: '/help/billing-tokens' },
  { label: 'Troubleshooting', href: '/help/troubleshooting' },
  { label: 'Contact', href: '/contact' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Cookies Policy', href: '/cookies' },
  { label: 'Refund & Cancellation Policy', href: '/refund' },
];

const SOCIAL_LINKS = [
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
];

const COMPANY_DETAILS = [
  { text: 'EVERFINA LTD', type: 'text' },
  { text: 'Company number 15645711', type: 'text' },
  { text: '20 Wenlock Road, London, England, N1 7GU', type: 'text' },
  { text: '+44 7833 647923', type: 'tel', href: 'tel:+447833647923' },
  { text: 'info@careerzen.co.uk', type: 'mailto', href: 'mailto:info@careerzen.co.uk' },
];

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/print-resume')) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="border-t border-[#E2E8F0] mt-10 py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 text-sm md:grid-cols-5">
          <div>
            <div className="font-semibold text-slate-900">Product</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {PRODUCT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Help</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {HELP_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Legal</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {LEGAL_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Company</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {COMPANY_DETAILS.map((item) => (
                <li key={item.text}>
                  {item.type === 'text' ? (
                    item.text
                  ) : (
                    <a href={item.href} className="hover:underline">
                      {item.text}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900">Socials</div>
            <ul className="mt-3 grid gap-2 text-slate-700">
              {SOCIAL_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-2">We accept</div>
            <div className="flex items-center gap-4">
              <Image
                src="/visa-logo.svg"
                alt="Visa"
                width={60}
                height={24}
                className="h-6 w-auto"
              />
              <Image
                src="/mastercard-logo.svg"
                alt="MasterCard"
                width={60}
                height={24}
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs text-slate-600 sm:flex-row">
          <div>© {year} EVERFINA LTD. All rights reserved.</div>
          <div>Registered in England & Wales</div>
        </div>
      </section>
    </motion.footer>
  );
}
