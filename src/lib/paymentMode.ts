function isTruthy(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

export function isWithoutPaymentEnabled() {
  return isTruthy(process.env.WITHOUT_PAYMENT);
}

export function buildBypassedPaymentResponse(details: {
  reason: string;
  approvedAt: string;
  orderMerchantId: string;
}) {
  return {
    bypassedGateway: true,
    reason: details.reason,
    approvedAt: details.approvedAt,
    orderMerchantId: details.orderMerchantId,
  };
}

export function isBypassedGatewayResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Boolean((value as { bypassedGateway?: unknown }).bypassedGateway);
}
