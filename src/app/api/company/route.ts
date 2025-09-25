import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const company = await prisma.company.findUnique({ where: { userId } });
  return NextResponse.json({ company });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id as string;
  const { firstName, lastName, contactEmail, phone, photo } = await req.json();
  const data: any = {
    name: firstName ?? '',
    vat: lastName ?? '',
    reg: contactEmail ?? '',
    address1: phone ?? '',
    logoUrl: photo ?? '',
    city: null,
    country: null,
    iban: null,
    bankName: null,
    bic: null,
  };
  let company = await prisma.company.findUnique({ where: { userId } });
  if (!company) {
    company = await prisma.company.create({ data: { userId, name: data.name || 'Profile' } });
  }
  const updated = await prisma.company.update({ where: { userId }, data });
  return NextResponse.json({ company: updated });
}
