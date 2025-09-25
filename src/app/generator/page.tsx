import { redirect } from 'next/navigation';
import { BUILDER_TEMPLATE_KEYS, DocType } from '@/components/builder/CVResumeBuilder';
import { ResumeTemplateKey } from '@/components/resume';

type PageProps = {
  searchParams?: {
    type?: string;
    template?: string;
  };
};

const isTemplateKey = (value?: string): value is ResumeTemplateKey =>
  !!value && BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey);

export default function GeneratorPage({ searchParams }: PageProps) {
  const docType: DocType = searchParams?.type === 'resume' ? 'resume' : 'cv';
  const template = isTemplateKey(searchParams?.template) ? searchParams!.template : undefined;

  const query = template ? `?template=${encodeURIComponent(template)}` : '';
  redirect(`/create-${docType}${query}`);
}
