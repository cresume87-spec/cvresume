import { redirect } from 'next/navigation';
import { BUILDER_TEMPLATE_KEYS, DocType } from '@/components/builder/CVResumeBuilder';
import { ResumeTemplateKey } from '@/components/resume';

type PageProps = {
  searchParams?: Promise<{ type?: string; template?: string }>;
};

const isTemplateKey = (value?: string): value is ResumeTemplateKey =>
  !!value && BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey);

export default async function GeneratorPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const docType: DocType = params.type === 'resume' ? 'resume' : 'cv';
  const template = isTemplateKey(params.template) ? params.template : undefined;

  const query = template ? `?template=${encodeURIComponent(template)}` : '';
  redirect(`/create-${docType}${query}`);
}
