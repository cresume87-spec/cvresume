import CVResumeBuilder, { BUILDER_TEMPLATE_KEYS } from '@/components/builder/CVResumeBuilder';
import { ResumeTemplateKey } from '@/components/resume';

type PageProps = {
  searchParams?: Promise<{ template?: string }>;
};

const isTemplateKey = (value?: string): value is ResumeTemplateKey =>
  !!value && BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey);

export default async function CreateCvPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const template = isTemplateKey(params.template) ? params.template : undefined;
  return <CVResumeBuilder initialDocType="cv" initialTemplate={template} />;
}
