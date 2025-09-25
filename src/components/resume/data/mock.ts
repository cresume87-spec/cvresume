import { Profile } from '@/components/resume/types';

export const sampleResumeData: Profile = {
  name: 'Elena Carter',
  firstName: 'Elena',
  lastName: 'Carter',
  role: 'Sales Advisor',
  summary:
    'UK-based sales professional with 5+ years across high-street retail and e-commerce. Proven track record of exceeding targets, mentoring junior staff, and improving NPS through structured consultative selling.',
  contacts: {
    email: 'elena.carter@outlook.com',
    phone: '+44 20 7946 0123',
    location: 'London, UK',
    website: 'https://elenacarter.co.uk',
    linkedin: 'https://linkedin.com/in/elenacarter-uk',
  },
  photo: '/mock_image.webp',
  experience: [
    {
      id: '1',
      title: 'Senior Sales Advisor',
      company: 'Regent Retail',
      location: 'London',
      start: '2022',
      end: 'Present',
      points: [
        'Exceeded quarterly revenue targets by 18% through consistent upsell playbooks and CRM hygiene.',
        'Launched weekly coaching sessions and reduced ramp time for new hires by 25%.',
        'Owned a VIP client portfolio of 120 accounts with 92% retention.',
      ],
    },
    {
      id: '2',
      title: 'Sales Associate',
      company: 'Northbridge Fashion',
      location: 'Manchester',
      start: '2020',
      end: '2022',
      points: [
        'Improved store NPS from 64 to 78 within eight months.',
        'Introduced product knowledge cards and cut onboarding time by 30%.',
      ],
    },
  ],
  education: [
    {
      id: 'e1',
      degree: 'B.A. in Business Management',
      school: 'University of Manchester',
      year: '2019',
      location: 'Manchester',
    },
  ],
  skills: [
    'Consultative selling',
    'CRM (Salesforce, HubSpot)',
    'Merchandising',
    'Customer service',
    'MS Office',
    'English C1',
  ],
};

export const sampleCVData: Profile = {
  ...sampleResumeData,
  summary:
    'UK-based sales professional with 5+ years in retail and e-commerce. CV version includes additional certifications and volunteering experience.',
  experience: [
    ...sampleResumeData.experience,
    {
      id: '3',
      title: 'Sales Intern',
      company: 'Outlet Co.',
      location: 'Birmingham',
      start: '2018',
      end: '2019',
      points: ['Assisted weekly stock audits and maintained visual standards.'],
    },
  ],
  education: [
    ...sampleResumeData.education,
    {
      id: 'e2',
      degree: 'CIM Sales and Marketing Certificate',
      school: 'Chartered Institute of Marketing',
      year: '2021',
      location: 'London',
    },
  ],
};
