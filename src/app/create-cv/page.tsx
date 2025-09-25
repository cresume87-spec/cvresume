import CVResumeBuilder, { BUILDER_TEMPLATE_KEYS } from '@/components/builder/CVResumeBuilder';
import { ResumeTemplateKey } from '@/components/resume';

type PageProps = {
  searchParams?: {
    template?: string;
  };
};

const isTemplateKey = (value?: string): value is ResumeTemplateKey =>
  !!value && BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey);

export default function CreateCvPage({ searchParams }: PageProps) {
  const template = isTemplateKey(searchParams?.template) ? (searchParams!.template as ResumeTemplateKey) : undefined;
  return <CVResumeBuilder initialDocType="cv" initialTemplate={template} />;
}
