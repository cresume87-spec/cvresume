import { db } from '@/lib/db';
import { getCardServStatus } from '@/lib/cardserv';
import type { CardServCurrency } from '@/lib/config';

type PaymentSyncResult =
  | {
      ok: true;
      state: string;
      orderMerchantId: string;
      orderSystemId: string | null;
      redirectUrl: string | null;
      threeDSAuth: Record<string, unknown> | null;
      raw: unknown;
      errorCode: number | null;
      errorMessage: string | null;
      transientNotFound: boolean;
      credited: boolean;
      alreadyCredited: boolean;
      tokenBalance?: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

export async function syncCardServOrder(orderMerchantId: string): Promise<PaymentSyncResult> {
  const order = await db.order.findFirst({
    where: { orderMerchantId },
    select: {
      id: true,
      userEmail: true,
      amount: true,
      currency: true,
      tokens: true,
      orderMerchantId: true,
      orderSystemId: true,
      status: true,
      response: true,
      creditedAt: true,
    },
  });

  if (!order) {
    return { ok: false, status: 404, error: 'Order not found' };
  }

  const status = await getCardServStatus(
    orderMerchantId,
    order.currency as CardServCurrency,
    order.orderSystemId,
  );

  const mergedResponse =
    order.response && typeof order.response === 'object'
      ? { ...(order.response as Record<string, unknown>), latestStatus: status.raw }
      : { latestStatus: status.raw };

  if (status.orderState !== 'APPROVED') {
    await db.order.update({
      where: { id: order.id },
      data: {
        status: status.orderState,
        orderSystemId: status.orderSystemId ?? order.orderSystemId,
        response: mergedResponse,
      },
    });

    return {
      ok: true,
      state: status.orderState,
      orderMerchantId,
      orderSystemId: status.orderSystemId ?? order.orderSystemId ?? null,
      redirectUrl: status.redirectUrl,
      threeDSAuth: status.threeDSAuth as Record<string, unknown> | null,
      raw: status.raw,
      errorCode: status.errorCode ?? null,
      errorMessage: status.errorMessage ?? null,
      transientNotFound:
        status.orderState === 'UNKNOWN' && Number((status.raw as { errorCode?: unknown } | null)?.errorCode) === -27,
      credited: false,
      alreadyCredited: Boolean(order.creditedAt),
    };
  }

  const approved = await db.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
      where: { id: order.id },
      select: {
        id: true,
        userEmail: true,
        amount: true,
        currency: true,
        tokens: true,
        orderSystemId: true,
        creditedAt: true,
      },
    });

    if (!currentOrder) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (currentOrder.creditedAt) {
      await tx.order.update({
        where: { id: currentOrder.id },
        data: {
          status: 'APPROVED',
          orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
          response: mergedResponse,
        },
      });

      const existingUser = currentOrder.userEmail
        ? await tx.user.findUnique({
            where: { email: currentOrder.userEmail },
            select: { tokenBalance: true },
          })
        : null;

      return {
        credited: false,
        alreadyCredited: true,
        tokenBalance: existingUser?.tokenBalance,
      };
    }

    if (!currentOrder.userEmail || !currentOrder.tokens) {
      await tx.order.update({
        where: { id: currentOrder.id },
        data: {
          status: 'APPROVED',
          orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
          response: mergedResponse,
        },
      });

      return {
        credited: false,
        alreadyCredited: false,
        tokenBalance: undefined,
      };
    }

    const claimedAt = new Date();
    const claim = await tx.order.updateMany({
      where: { id: currentOrder.id, creditedAt: null },
      data: {
        status: 'APPROVED',
        orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
        response: mergedResponse,
        creditedAt: claimedAt,
      },
    });

    if (claim.count === 0) {
      const existingUser = await tx.user.findUnique({
        where: { email: currentOrder.userEmail },
        select: { tokenBalance: true },
      });

      return {
        credited: false,
        alreadyCredited: true,
        tokenBalance: existingUser?.tokenBalance,
      };
    }

    const user = await tx.user.findUnique({
      where: { email: currentOrder.userEmail },
      select: { id: true, tokenBalance: true },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const newBalance = user.tokenBalance + currentOrder.tokens;

    await tx.user.update({
      where: { id: user.id },
      data: { tokenBalance: newBalance },
    });

    await tx.ledgerEntry.create({
      data: {
        userId: user.id,
        type: 'Top-up',
        delta: currentOrder.tokens,
        balanceAfter: newBalance,
        currency: currentOrder.currency,
        amount: Math.round(currentOrder.amount * 100),
        receiptUrl: `order:${orderMerchantId}`,
      },
    });

    return {
      credited: true,
      alreadyCredited: false,
      tokenBalance: newBalance,
    };
  });

  return {
    ok: true,
    state: 'APPROVED',
    orderMerchantId,
    orderSystemId: status.orderSystemId ?? order.orderSystemId ?? null,
    redirectUrl: status.redirectUrl,
    threeDSAuth: status.threeDSAuth as Record<string, unknown> | null,
    raw: status.raw,
    errorCode: status.errorCode ?? null,
    errorMessage: status.errorMessage ?? null,
    transientNotFound: false,
    credited: approved.credited,
    alreadyCredited: approved.alreadyCredited,
    tokenBalance: approved.tokenBalance,
  };
}
