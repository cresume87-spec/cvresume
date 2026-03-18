import { db } from '@/lib/db';
import { getCardServStatus } from '@/lib/cardserv';
import type { CardServCurrency } from '@/lib/config';
import { sendOrderConfirmationEmail } from '@/lib/orderConfirmationEmail';
import { buildOrderInvoiceNumber } from '@/lib/orderInvoice';

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

function getRecipientName(
  user:
    | {
        firstName: string | null;
        lastName: string | null;
        name: string | null;
      }
    | null,
  email: string,
) {
  const fullName = [user?.firstName?.trim(), user?.lastName?.trim()]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  if (user?.name?.trim()) {
    return user.name.trim();
  }

  const localPart = email.split('@')[0]?.trim();
  return localPart || 'there';
}

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
        description: true,
        tokens: true,
        orderSystemId: true,
        invoiceNumber: true,
        confirmationEmailSentAt: true,
        creditedAt: true,
        createdAt: true,
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
        orderId: currentOrder.id,
        credited: false,
        alreadyCredited: true,
        tokenBalance: existingUser?.tokenBalance,
        userEmail: currentOrder.userEmail,
        description: currentOrder.description,
        amount: currentOrder.amount,
        currency: currentOrder.currency,
        tokens: currentOrder.tokens,
        orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
        invoiceNumber: currentOrder.invoiceNumber,
        confirmationEmailSentAt: currentOrder.confirmationEmailSentAt,
        createdAt: currentOrder.createdAt,
        paidAt: currentOrder.creditedAt,
        recipientName: null,
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
        orderId: currentOrder.id,
        credited: false,
        alreadyCredited: false,
        tokenBalance: undefined,
        userEmail: currentOrder.userEmail,
        description: currentOrder.description,
        amount: currentOrder.amount,
        currency: currentOrder.currency,
        tokens: currentOrder.tokens,
        orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
        invoiceNumber: currentOrder.invoiceNumber,
        confirmationEmailSentAt: currentOrder.confirmationEmailSentAt,
        createdAt: currentOrder.createdAt,
        paidAt: null,
        recipientName: null,
      };
    }

    const invoiceNumber =
      currentOrder.invoiceNumber ?? buildOrderInvoiceNumber(currentOrder.id, currentOrder.createdAt);
    const claimedAt = new Date();
    const claim = await tx.order.updateMany({
      where: { id: currentOrder.id, creditedAt: null },
      data: {
        status: 'APPROVED',
        orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
        response: mergedResponse,
        creditedAt: claimedAt,
        invoiceNumber,
      },
    });

    if (claim.count === 0) {
      const existingUser = await tx.user.findUnique({
        where: { email: currentOrder.userEmail },
        select: { tokenBalance: true },
      });

      return {
        orderId: currentOrder.id,
        credited: false,
        alreadyCredited: true,
        tokenBalance: existingUser?.tokenBalance,
        userEmail: currentOrder.userEmail,
        description: currentOrder.description,
        amount: currentOrder.amount,
        currency: currentOrder.currency,
        tokens: currentOrder.tokens,
        orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
        invoiceNumber,
        confirmationEmailSentAt: currentOrder.confirmationEmailSentAt,
        createdAt: currentOrder.createdAt,
        paidAt: currentOrder.creditedAt,
        recipientName: null,
      };
    }

    const user = await tx.user.findUnique({
      where: { email: currentOrder.userEmail },
      select: { id: true, tokenBalance: true, name: true, firstName: true, lastName: true },
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
        invoiceNumber,
      },
    });

    return {
      orderId: currentOrder.id,
      credited: true,
      alreadyCredited: false,
      tokenBalance: newBalance,
      userEmail: currentOrder.userEmail,
      description: currentOrder.description,
      amount: currentOrder.amount,
      currency: currentOrder.currency,
      tokens: currentOrder.tokens,
      orderSystemId: status.orderSystemId ?? currentOrder.orderSystemId,
      invoiceNumber,
      confirmationEmailSentAt: currentOrder.confirmationEmailSentAt,
      createdAt: currentOrder.createdAt,
      paidAt: claimedAt,
      recipientName: getRecipientName(user, currentOrder.userEmail),
    };
  });

  if (
    approved.credited &&
    approved.userEmail &&
    approved.tokens &&
    approved.invoiceNumber &&
    approved.paidAt &&
    !approved.confirmationEmailSentAt
  ) {
    try {
      await sendOrderConfirmationEmail({
        recipientName: approved.recipientName || approved.userEmail,
        invoiceNumber: approved.invoiceNumber,
        issueDate: approved.createdAt,
        paidDate: approved.paidAt,
        customerName: approved.recipientName || approved.userEmail,
        customerEmail: approved.userEmail,
        orderMerchantId,
        orderSystemId: approved.orderSystemId ?? null,
        description:
          approved.description?.trim() || `CareerZen token top-up (${approved.tokens} tokens)`,
        tokens: approved.tokens,
        amount: approved.amount,
        currency: approved.currency,
      });

      await db.order.update({
        where: { id: approved.orderId },
        data: { confirmationEmailSentAt: new Date() },
      });
    } catch (error) {
      console.error('[ORDER_CONFIRMATION_EMAIL_ERROR]', {
        orderMerchantId,
        invoiceNumber: approved.invoiceNumber,
      });
      console.error(error);
    }
  }

  return {
    ok: true,
    state: 'APPROVED',
    orderMerchantId,
    orderSystemId: approved.orderSystemId ?? status.orderSystemId ?? order.orderSystemId ?? null,
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
