import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  const expected = process.env.SEED_SECRET;
  // If a secret is set, enforce it. If not set, allow seeding for convenience in dev.
  if (expected && secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const passwordPlain = 'password123';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  const users = [
    { email: 'user-with-tokens@example.com', name: 'Test User (tokens)', tokenBalance: 100 },
    { email: 'user-without-tokens@example.com', name: 'Test User (no tokens)', tokenBalance: 0 },
  ];

  const results = [] as any[];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { tokenBalance: u.tokenBalance, password: passwordHash },
      create: { email: u.email.toLowerCase(), name: u.name, tokenBalance: u.tokenBalance, currency: 'GBP' as any, password: passwordHash },
    });
    results.push({ id: user.id, email: user.email, tokenBalance: user.tokenBalance });
  }

  return NextResponse.json({ ok: true, users: results });
}
