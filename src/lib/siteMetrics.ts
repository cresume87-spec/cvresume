import { prisma } from '@/lib/prisma';

export const RESUMES_CREATED_METRIC_KEY = 'resumes_created_count';
export const RESUMES_CREATED_GROWTH_AT_KEY = 'resumes_created_count_last_growth_at';
export const DEFAULT_RESUMES_CREATED_COUNT = 16356;
const AUTO_GROWTH_INTERVAL_SECONDS = 2 * 60;
const AUTO_GROWTH_INCREMENT = 3;

export async function getResumeCreatedCount(): Promise<number> {
  return syncResumeCreatedCount();
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

async function syncResumeCreatedCount(): Promise<number> {
  const currentTimestampSeconds = Math.floor(Date.now() / 1000);

  const syncedValue = await prisma.$transaction(async (tx) => {
    await tx.siteMetric.upsert({
      where: { key: RESUMES_CREATED_METRIC_KEY },
      update: {},
      create: {
        key: RESUMES_CREATED_METRIC_KEY,
        value: DEFAULT_RESUMES_CREATED_COUNT,
      },
    });

    await tx.siteMetric.upsert({
      where: { key: RESUMES_CREATED_GROWTH_AT_KEY },
      update: {},
      create: {
        key: RESUMES_CREATED_GROWTH_AT_KEY,
        value: currentTimestampSeconds,
      },
    });

    const [countMetric, growthMetric] = await Promise.all([
      tx.siteMetric.findUnique({
        where: { key: RESUMES_CREATED_METRIC_KEY },
        select: { value: true },
      }),
      tx.siteMetric.findUnique({
        where: { key: RESUMES_CREATED_GROWTH_AT_KEY },
        select: { value: true },
      }),
    ]);

    const currentCount = countMetric?.value ?? DEFAULT_RESUMES_CREATED_COUNT;
    const lastGrowthAt = growthMetric?.value ?? currentTimestampSeconds;
    const elapsedIntervals = Math.floor(
      Math.max(0, currentTimestampSeconds - lastGrowthAt) / AUTO_GROWTH_INTERVAL_SECONDS,
    );

    if (elapsedIntervals <= 0) {
      return currentCount;
    }

    const nextGrowthAt = lastGrowthAt + elapsedIntervals * AUTO_GROWTH_INTERVAL_SECONDS;
    const claimedGrowth = await tx.siteMetric.updateMany({
      where: {
        key: RESUMES_CREATED_GROWTH_AT_KEY,
        value: lastGrowthAt,
      },
      data: {
        value: nextGrowthAt,
      },
    });

    if (claimedGrowth.count === 0) {
      return null;
    }

    const incrementBy = elapsedIntervals * AUTO_GROWTH_INCREMENT;
    const updatedCountMetric = await tx.siteMetric.update({
      where: { key: RESUMES_CREATED_METRIC_KEY },
      data: {
        value: {
          increment: incrementBy,
        },
      },
      select: { value: true },
    });

    return updatedCountMetric.value;
  });

  if (typeof syncedValue === 'number') {
    return syncedValue;
  }

  const metric = await prisma.siteMetric.findUnique({
    where: { key: RESUMES_CREATED_METRIC_KEY },
    select: { value: true },
  });

  return metric?.value ?? DEFAULT_RESUMES_CREATED_COUNT;
}
