import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ContactEmail } from '@/components/emails/ContactEmail';
import { getDefaultEmailFrom, getResendClient } from '@/lib/emailClient';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = contactFormSchema.safeParse(body);

    if (!validation.success) {
      console.error('Zod validation failed:', validation.error.errors);
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const { name, email, message } = validation.data;

    const resend = getResendClient();
    if (!resend) {
      console.error('Resend API key is missing.');
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 503 },
      );
    }

    const { error } = await resend.emails.send({
      from: getDefaultEmailFrom('CareerZen Contact Form'),
      to: [process.env.EMAIL_FROM || 'info@careerzen.co.uk'],
      subject: `New message from ${name}`,
      replyTo: email,
      react: ContactEmail({ name, email, message }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send message.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
