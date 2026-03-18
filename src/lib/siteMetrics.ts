import { prisma } from '@/lib/prisma';

export const RESUMES_CREATED_METRIC_KEY = 'resumes_created_count';
export const DEFAULT_RESUMES_CREATED_COUNT = 16356;

export async function getResumeCreatedCount(): Promise<number> {
  const metric = await prisma.siteMetric.findUnique({
    where: { key: RESUMES_CREATED_METRIC_KEY },
    select: { value: true },
  });

  return metric?.value ?? DEFAULT_RESUMES_CREATED_COUNT;
}

export async function incrementResumeCreatedCount(increment: number = 1): Promise<number> {
  const safeIncrement = Number.isFinite(increment) ? Math.max(0, Math.floor(increment)) : 0;
  if (safeIncrement <= 0) {
    return getResumeCreatedCount();
  }

  const metric = await prisma.siteMetric.upsert({
    where: { key: RESUMES_CREATED_METRIC_KEY },
    update: {
      value: {
        increment: safeIncrement,
      },
    },
    create: {
      key: RESUMES_CREATED_METRIC_KEY,
      value: DEFAULT_RESUMES_CREATED_COUNT + safeIncrement,
    },
    select: { value: true },
  });

  return metric.value;
}
