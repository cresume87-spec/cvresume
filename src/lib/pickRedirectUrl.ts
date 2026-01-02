export function pickRedirectUrl(data: any): string | null {
  return (
    data?.redirectData?.redirectUrl ||
    data?.redirectData?.threeDSRedirectUrl ||
    data?.outputRedirectToUrl ||
    data?.redirectUrl ||
    null
  );
}
