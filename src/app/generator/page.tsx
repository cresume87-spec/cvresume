import { redirect } from 'next/navigation';
import { DocType } from '@/components/builder/CVResumeBuilder';
import { isResumeTemplateKey } from '@/lib/resume/templates';

type PageProps = {
  searchParams?: Promise<{ type?: string; template?: string }>;
};

export default async function GeneratorPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const docType: DocType = params.type === 'resume' ? 'resume' : 'cv';
  const template = isResumeTemplateKey(params.template) ? params.template : undefined;

  const query = template ? `?template=${encodeURIComponent(template)}` : '';
  redirect(`/create-${docType}${query}`);
}
