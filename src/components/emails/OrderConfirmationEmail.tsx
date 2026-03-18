import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

type OrderConfirmationEmailProps = {
  recipientName: string;
  invoiceNumber: string;
  orderMerchantId: string;
  amountLabel: string;
  tokens: number;
  dashboardUrl: string;
};

export function OrderConfirmationEmail({
  recipientName,
  invoiceNumber,
  orderMerchantId,
  amountLabel,
  tokens,
  dashboardUrl,
}: OrderConfirmationEmailProps) {
  const year = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Your CareerZen order has been confirmed.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={hero}>
            <Text style={eyebrow}>Order confirmed</Text>
            <Heading style={heading}>Payment received, {recipientName}.</Heading>
            <Text style={heroText}>
              Your CareerZen order has been approved and your tokens are now available in your account.
              Your invoice PDF is attached to this email.
            </Text>
          </Section>

          <Section style={content}>
            <Section style={summaryCard}>
              <Text style={summaryLabel}>Invoice number</Text>
              <Text style={summaryValue}>{invoiceNumber}</Text>
              <Text style={summaryMeta}>Merchant reference: {orderMerchantId}</Text>
              <Text style={summaryMeta}>Total paid: {amountLabel}</Text>
              <Text style={summaryMeta}>Tokens credited: {tokens}</Text>
            </Section>

            <Text style={bodyText}>
              Keep this email for your records. You can now open your dashboard and continue working on
              your CV or resume.
            </Text>

            <Section style={actions}>
              <Button href={dashboardUrl} style={primaryButton}>
                Open Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footnote}>
              If you did not authorize this payment, contact support immediately and include invoice
              number {invoiceNumber}.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {year} CareerZen. Order confirmation and invoice attached.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  margin: 0,
  padding: '32px 16px',
  backgroundColor: '#eef5ff',
  fontFamily: 'Arial, sans-serif',
  color: '#10233f',
};

const container = {
  maxWidth: '680px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  overflow: 'hidden',
  border: '1px solid #d9e6fb',
  boxShadow: '0 18px 48px rgba(24, 49, 83, 0.10)',
};

const hero = {
  padding: '40px 40px 28px',
  background: 'linear-gradient(135deg,#14315d 0%,#2563eb 100%)',
};

const eyebrow = {
  display: 'inline-block',
  margin: 0,
  padding: '8px 12px',
  borderRadius: '999px',
  backgroundColor: 'rgba(255,255,255,0.14)',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
};

const heading = {
  margin: '18px 0 12px',
  color: '#ffffff',
  fontSize: '34px',
  lineHeight: '1.15',
  fontWeight: '800',
};

const heroText = {
  margin: 0,
  color: 'rgba(255,255,255,0.88)',
  fontSize: '16px',
  lineHeight: '1.7',
};

const content = {
  padding: '32px 40px',
};

const summaryCard = {
  marginBottom: '24px',
  padding: '22px 24px',
  borderRadius: '20px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const summaryLabel = {
  margin: '0 0 8px',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#5e769e',
};

const summaryValue = {
  margin: '0 0 10px',
  fontSize: '26px',
  fontWeight: '800',
  color: '#14315d',
};

const summaryMeta = {
  margin: '0 0 8px',
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#334155',
};

const bodyText = {
  margin: '0 0 20px',
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#475569',
};

const actions = {
  marginBottom: '24px',
};

const primaryButton = {
  display: 'inline-block',
  borderRadius: '12px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '800',
  padding: '14px 22px',
};

const divider = {
  borderColor: '#d9e6fb',
  margin: '0 0 18px',
};

const footnote = {
  margin: 0,
  fontSize: '13px',
  lineHeight: '1.7',
  color: '#64748b',
};

const footer = {
  padding: '18px 40px 28px',
};

const footerText = {
  margin: 0,
  fontSize: '12px',
  lineHeight: '1.7',
  color: '#64748b',
};
