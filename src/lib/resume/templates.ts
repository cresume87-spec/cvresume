import { ResumeTemplateKey } from '@/components/resume';

export const BUILDER_TEMPLATE_KEYS: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

export const isResumeTemplateKey = (value?: string): value is ResumeTemplateKey =>
  !!value && BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey);
