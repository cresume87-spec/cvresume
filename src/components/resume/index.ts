export * from '@/components/resume/types';
export * from '@/components/resume/ui';
export { sampleResumeData, sampleCVData } from '@/components/resume/data/mock';
export { emptyResumeData, emptyCVData } from '@/components/resume/data/empty';

import ClassicATS from '@/components/resume/templates/ClassicATS';
import ModernSplit from '@/components/resume/templates/ModernSplit';
import ElegantSerif from '@/components/resume/templates/ElegantSerif';
import TechCompact from '@/components/resume/templates/TechCompact';

export const ResumeTemplates = {
  classic: ClassicATS,
  split: ModernSplit,
  serif: ElegantSerif,
  tech: TechCompact,
};

export type ResumeTemplateKey = keyof typeof ResumeTemplates; // 'classic' | 'split' | 'serif' | 'tech'

