import CVResumeBuilder from '@/components/builder/CVResumeBuilder';
import { isResumeTemplateKey } from '@/lib/resume/templates';

type PageProps = {
  searchParams?: Promise<{ template?: string; documentId?: string }>;
};

export default async function CreateCvPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const template = isResumeTemplateKey(params.template) ? params.template : undefined;
  return <CVResumeBuilder initialDocType="cv" initialTemplate={template} />;
}
