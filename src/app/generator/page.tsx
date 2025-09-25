import CVResumeBuilder from '@/components/builder/CVResumeBuilder';
import { ResumeTemplateKey } from '@/components/resume';

type GeneratorPageProps = {
  searchParams?: {
    type?: string;
    template?: string;
  };
};

const ALLOWED_TEMPLATES: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

export default function GeneratorPage({ searchParams }: GeneratorPageProps) {
  const docType = searchParams?.type === 'cv' ? 'cv' : 'resume';
  const rawTemplate = searchParams?.template;
  const template = ALLOWED_TEMPLATES.includes(rawTemplate as ResumeTemplateKey)
    ? (rawTemplate as ResumeTemplateKey)
    : 'classic';

  return <CVResumeBuilder initialDocType={docType} initialTemplate={template} />;
}
