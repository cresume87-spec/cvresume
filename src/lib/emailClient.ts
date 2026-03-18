import { Resend } from 'resend';

let resendClient: Resend | null | undefined;

export function getResendClient(): Resend | null {
  if (resendClient !== undefined) {
    return resendClient;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    resendClient = null;
    return resendClient;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
}

export function getDefaultEmailFrom(label: string): string {
  const fromAddress = process.env.EMAIL_FROM || 'info@careerzen.co.uk';
  return `${label} <${fromAddress}>`;
}
