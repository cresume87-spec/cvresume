type RedirectCandidate = {
  redirectData?: {
    redirectUrl?: string | null;
    threeDSRedirectUrl?: string | null;
  } | null;
  outputRedirectToUrl?: string | null;
  redirectUrl?: string | null;
} | null;

export function pickRedirectUrl(data: RedirectCandidate): string | null {
  return (
    data?.redirectData?.redirectUrl ||
    data?.redirectData?.threeDSRedirectUrl ||
    data?.outputRedirectToUrl ||
    data?.redirectUrl ||
    null
  );
}
