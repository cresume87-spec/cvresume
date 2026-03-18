'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import PlanCard from '@/components/pricing/PlanCard';
import CustomPlanCard from '@/components/pricing/CustomPlanCard';
import { convertTokensToCurrency, PRICING_PLANS, SERVICE_COSTS } from '@/lib/currency';
import { usePreferredCurrency } from '@/lib/currencyPreference';

export default function Pricing() {
  const [currency] = usePreferredCurrency();

  const handleTopUpRequest = () => {
    toast.info('Token top-ups are handled manually. Please contact support.');
  };

  const actionPrices = useMemo(
    () =>
      [
        ['Create CV', SERVICE_COSTS.CREATE_DRAFT],
        ['Create resume', SERVICE_COSTS.CREATE_DRAFT],
        ['Create & Export PDF', SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_PDF],
        ['Create & Export DOCX', SERVICE_COSTS.CREATE_DRAFT + SERVICE_COSTS.EXPORT_DOCX],
        ['Manager', SERVICE_COSTS.PERSONAL_MANAGER],
      ] as const,
    [],
  );

  return (
    <Section id="pricing" className="py-14">
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold sm:text-3xl">Token top-up plans</h2>
        <p className="mt-2 text-slate-600">Tokens are charged per action. No subscription or hidden fees.</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-4">
        {PRICING_PLANS.map((plan) => {
          const convertedAmount = convertTokensToCurrency(plan.tokens, currency);

          return (
            <PlanCard
              key={plan.name}
              name={plan.name}
              popular={plan.popular}
              bullets={[...plan.bullets]}
              cta={plan.cta}
              amount={convertedAmount}
              currency={currency}
              tokens={plan.tokens}
              onAction={handleTopUpRequest}
            />
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <CustomPlanCard currency={currency} onRequest={handleTopUpRequest} />
        </motion.div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        <Card className="border-dashed">
          <div className="font-semibold">How much does an action cost?</div>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-5">
            {actionPrices.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-semibold">{value} tok.</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">Tokens never expire. Refunds for exports are not provided.</div>
        </Card>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Displayed prices already include VAT. Tokens deposit after purchase (signed-in users only).
      </p>
    </Section>
  );
}
