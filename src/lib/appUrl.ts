export function getAppOrigin(): string {
  const configured =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL;

  if (!configured) {
    return 'http://localhost:3000';
  }

  return configured.startsWith('http') ? configured : `https://${configured}`;
}

export function getAbsoluteAppUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getAppOrigin()}${normalizedPath}`;
}
