import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendRegistrationConfirmationEmail } from '@/lib/registrationEmail';
import { normalizeSignupProfile, signupProfileSchema } from '@/lib/signupProfile';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = signupProfileSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { message: firstIssue?.message || 'Invalid registration details.' },
        { status: 400 },
      );
    }

    const input = normalizeSignupProfile(parsed.data);

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.email.split('@')[0],
        phone: input.phone,
        dateOfBirth: input.dateOfBirth,
        addressLine1: input.addressLine1,
        addressCity: input.addressCity,
        addressCountryCode: input.addressCountryCode,
        addressPostalCode: input.addressPostalCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    void sendRegistrationConfirmationEmail({
      email: input.email,
      name: newUser.name,
    }).catch((error) => {
      console.error('[REGISTER_CONFIRMATION_EMAIL_ERROR]', error);
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('[REGISTER_ERROR]', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
