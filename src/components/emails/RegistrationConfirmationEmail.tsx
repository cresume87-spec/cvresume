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

type RegistrationConfirmationEmailProps = {
  recipientName: string;
  registeredEmail: string;
  dashboardUrl: string;
  pricingUrl: string;
  createCvUrl: string;
};

export function RegistrationConfirmationEmail({
  recipientName,
  registeredEmail,
  dashboardUrl,
  pricingUrl,
  createCvUrl,
}: RegistrationConfirmationEmailProps) {
  const year = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>Your CareerZen account is ready.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={hero}>
            <Text style={eyebrow}>Welcome to CareerZen</Text>
            <Heading style={heading}>Your account is ready, {recipientName}.</Heading>
            <Text style={heroText}>
              Registration completed successfully. You can now open your dashboard,
              top up tokens when you need them, and create your first CV or resume.
            </Text>
          </Section>

          <Section style={content}>
            <Section style={statsGrid}>
              <div style={statCard}>
                <Text style={statLabel}>Account status</Text>
                <Text style={statValue}>Active</Text>
              </div>
              <div style={statCard}>
                <Text style={statLabel}>Registered email</Text>
                <Text style={statEmail}>{registeredEmail}</Text>
              </div>
            </Section>

            <Section style={nextStepsCard}>
              <Text style={nextStepsTitle}>What you can do next</Text>
              <Text style={step}>1. Open your dashboard and review your account.</Text>
              <Text style={step}>2. Top up tokens when you are ready to use paid actions.</Text>
              <Text style={step}>3. Create your first CV or resume and keep refining it.</Text>
            </Section>

            <Section style={actions}>
              <Button href={dashboardUrl} style={primaryButton}>
                Open Dashboard
              </Button>
              <Button href={pricingUrl} style={secondaryButton}>
                View Pricing
              </Button>
            </Section>

            <Text style={supportText}>
              Ready to begin? Start with your dashboard or jump straight into your first document:
            </Text>
            <Text style={linkRow}>
              <a href={createCvUrl} style={textLink}>
                Create my CV
              </a>
            </Text>

            <Hr style={divider} />

            <Text style={footnote}>
              If this registration was not made by you, please contact support as soon as possible.
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {year} CareerZen. Your account has been created successfully.</Text>
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

const statsGrid = {
  marginBottom: '28px',
};

const statCard = {
  display: 'inline-block',
  verticalAlign: 'top' as const,
  width: 'calc(50% - 10px)',
  minWidth: '220px',
  marginRight: '16px',
  marginBottom: '16px',
  padding: '18px',
  borderRadius: '18px',
  backgroundColor: '#f6f9ff',
  border: '1px solid #d9e6fb',
  boxSizing: 'border-box' as const,
};

const statLabel = {
  margin: '0 0 8px',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: '#5e769e',
};

const statValue = {
  margin: 0,
  fontSize: '26px',
  fontWeight: '800',
  color: '#14315d',
};

const statEmail = {
  margin: 0,
  fontSize: '18px',
  fontWeight: '700',
  color: '#0f172a',
  wordBreak: 'break-word' as const,
};

const nextStepsCard = {
  marginBottom: '28px',
  padding: '22px 24px',
  borderRadius: '20px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const nextStepsTitle = {
  margin: '0 0 14px',
  fontSize: '14px',
  fontWeight: '800',
  color: '#0f172a',
};

const step = {
  margin: '0 0 12px',
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#334155',
};

const actions = {
  marginBottom: '24px',
};

const primaryButton = {
  display: 'inline-block',
  marginRight: '12px',
  borderRadius: '12px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  textDecoration: 'none',
  fontWeight: '800',
  padding: '14px 22px',
};

const secondaryButton = {
  display: 'inline-block',
  borderRadius: '12px',
  backgroundColor: '#edf4ff',
  color: '#14315d',
  textDecoration: 'none',
  fontWeight: '800',
  padding: '14px 22px',
  border: '1px solid #d9e6fb',
};

const supportText = {
  margin: '0 0 8px',
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#475569',
};

const linkRow = {
  margin: '0 0 18px',
  fontSize: '14px',
  lineHeight: '1.7',
};

const textLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: '700',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0 0 22px',
};

const footnote = {
  margin: 0,
  fontSize: '13px',
  lineHeight: '1.7',
  color: '#64748b',
};

const footer = {
  padding: '18px 40px',
  backgroundColor: '#f8fafc',
  borderTop: '1px solid #e2e8f0',
};

const footerText = {
  margin: 0,
  fontSize: '12px',
  color: '#64748b',
};
