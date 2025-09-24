export const pricingPlans = [
  {
    id: 'plan-starter',
    name: 'Beginner',
    baseGBP: 10,
    baseEUR: 10,
    tokens: 1000,
    popular: false,
    cta: 'Request top-up',
    bullets: [
      'Top up 1,000 tokens (~100 documents)',
      'No subscription',
      'Draft and preview for free',
    ],
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    baseGBP: 50,
    baseEUR: 50,
    tokens: 5000,
    popular: true,
    cta: 'Request top-up',
    bullets: [
      'Top up 5,000 tokens (~500 documents)',
      'Templates and branding',
      'Collaboration tools',
      'Read receipts',
    ],
  },
  {
    id: 'plan-business',
    name: 'Business',
    baseGBP: 100,
    baseEUR: 100,
    tokens: 10000,
    popular: false,
    cta: 'Request top-up',
    bullets: [
      'Top up 10,000 tokens (~1,000 documents)',
      'Team management and roles',
      'API and webhooks',
      'Priority support',
    ],
  },
];

export type Plan = (typeof pricingPlans)[0];
export type Currency = 'GBP' | 'EUR';
