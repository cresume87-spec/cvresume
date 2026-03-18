import { RegistrationConfirmationEmail } from '@/components/emails/RegistrationConfirmationEmail';
import { getAbsoluteAppUrl } from '@/lib/appUrl';
import { getDefaultEmailFrom, getResendClient } from '@/lib/emailClient';

type RegistrationUser = {
  email: string;
  name: string | null;
};

function getRecipientName(user: RegistrationUser): string {
  if (user.name?.trim()) {
    return user.name.trim();
  }

  const localPart = user.email.split('@')[0]?.trim();
  return localPart || 'there';
}

function buildRegistrationEmailText(user: RegistrationUser): string {
  const recipientName = getRecipientName(user);

  return [
    `Hi ${recipientName},`,
    '',
    'Welcome to CareerZen.',
    'Your account has been created successfully and is now active.',
    '',
    `Registered email: ${user.email}`,
    `Dashboard: ${getAbsoluteAppUrl('/dashboard')}`,
    `Pricing: ${getAbsoluteAppUrl('/pricing')}`,
    `Create my CV: ${getAbsoluteAppUrl('/create-cv')}`,
    '',
    'Next steps:',
    '1. Open your dashboard and review your account.',
    '2. Top up tokens when you are ready to use paid actions.',
    '3. Create your first CV or resume.',
    '',
    'If this registration was not made by you, please contact support as soon as possible.',
  ].join('\n');
}

export async function sendRegistrationConfirmationEmail(user: RegistrationUser) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error('Email service is not configured.');
  }

  const recipientName = getRecipientName(user);

  const { error } = await resend.emails.send({
    from: getDefaultEmailFrom('CareerZen'),
    to: user.email,
    subject: 'Welcome to CareerZen',
    react: RegistrationConfirmationEmail({
      recipientName,
      registeredEmail: user.email,
      dashboardUrl: getAbsoluteAppUrl('/dashboard'),
      pricingUrl: getAbsoluteAppUrl('/pricing'),
      createCvUrl: getAbsoluteAppUrl('/create-cv'),
    }),
    text: buildRegistrationEmailText(user),
  });

  if (error) {
    throw new Error(error.message || 'Failed to send registration confirmation email.');
  }
}
