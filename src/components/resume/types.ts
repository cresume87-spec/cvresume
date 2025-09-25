export type TemplateKey = 'classic' | 'split' | 'serif' | 'tech';

export type Contacts = {
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
};

export type Experience = {
  id: string;
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  points: string[];
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  year: string;
  location: string;
};

export type Profile = {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  summary: string;
  contacts: Contacts;
  experience: Experience[];
  education: Education[];
  skills: string[];
  photo: string;
};
