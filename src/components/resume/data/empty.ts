import { Profile } from '@/components/resume/types';

export const emptyProfile = (): Profile => ({
  name: '',
  role: '',
  summary: '',
  contacts: { email: '', phone: '', location: '', website: '', linkedin: '' },
  experience: [],
  education: [],
  skills: [],
  photo: '',
});

export const emptyResumeData: Profile = emptyProfile();
export const emptyCVData: Profile = emptyProfile();

