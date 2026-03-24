import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import chromiumMin from '@sparticuz/chromium-min';
import { getAppOrigin } from '@/lib/appUrl';

type PdfRouteContext = {
  label: string;
  url: string;
};

const PDF_VIEWPORT = { width: 1240, height: 1754, deviceScaleFactor: 2 } as const;
const PDF_OPTIONS = {
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', right: '14mm', bottom: '16mm', left: '14mm' },
  preferCSSPageSize: true,
} as const;

let cachedExecutablePath: string | null = null;

function getPackUrl() {
  return `${getAppOrigin()}/chromium-pack.tar`;
}

function getServerlessLibPath() {
  const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] || '20', 10);
  return nodeMajor >= 20 ? '/tmp/al2023/lib' : '/tmp/al2/lib';
}

function ensureServerlessLibraryPath() {
  const baseLibPath = getServerlessLibPath();
  process.env.FONTCONFIG_PATH ??= '/tmp/fonts';

  if (process.env.LD_LIBRARY_PATH === undefined) {
    process.env.LD_LIBRARY_PATH = baseLibPath;
    return;
  }

  if (!process.env.LD_LIBRARY_PATH.startsWith(baseLibPath)) {
    process.env.LD_LIBRARY_PATH = [baseLibPath, ...new Set(process.env.LD_LIBRARY_PATH.split(':'))].join(':');
  }
}

function findLocalChromeExecutable() {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (envPath) {
    return envPath;
  }

  const candidates =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
          path.join(process.env.PROGRAMFILES || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
          path.join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft\\Edge\\Application\\msedge.exe'),
        ]
      : process.platform === 'darwin'
        ? [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
          ]
        : [
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium',
            '/snap/bin/chromium',
          ];

  return candidates.find((candidate) => candidate && fs.existsSync(candidate));
}

async function resolveExecutablePath() {
  if (cachedExecutablePath) {
    return { executablePath: cachedExecutablePath, mode: 'cached' };
  }

  const localExecutablePath = findLocalChromeExecutable();
  if (!process.env.VERCEL && localExecutablePath) {
    cachedExecutablePath = localExecutablePath;
    return { executablePath: cachedExecutablePath, mode: 'local' };
  }

  ensureServerlessLibraryPath();
  cachedExecutablePath = await chromiumMin.executablePath(getPackUrl());
  return { executablePath: cachedExecutablePath, mode: 'vercel-packed-chromium' };
}

export async function renderPdfFromAppRoute({ label, url }: PdfRouteContext) {
  const { executablePath, mode } = await resolveExecutablePath();
  const logContext = {
    label,
    url,
    mode,
    executablePath,
    deployedCommit: process.env.VERCEL_GIT_COMMIT_SHA || null,
  };

  console.log('[SERVER_PDF_RENDER_START]', logContext);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: PDF_VIEWPORT,
    executablePath,
    headless: chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: 30000 });
    const pdfBuffer = await page.pdf(PDF_OPTIONS);

    console.log('[SERVER_PDF_RENDER_SUCCESS]', {
      ...logContext,
      size: pdfBuffer.length,
    });

    return pdfBuffer;
  } catch (error) {
    console.error('[SERVER_PDF_RENDER_ERROR]', logContext);
    throw error;
  } finally {
    try {
      for (const page of await browser.pages()) {
        await page.close();
      }
      await browser.close();
    } catch {}
  }
}
