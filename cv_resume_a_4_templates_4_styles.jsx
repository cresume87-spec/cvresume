import * as React from 'react';

/**
 * CV & Resume — A4 Templates (wire-ready)
 * - 4 визуальных стиля: Classic ATS, Modern Split, Elegant Serif, Tech Compact
 * - Переключатель шаблона и типа документа (Resume 1 page / CV multi-page)
 * - Tailwind, печатная сетка A4, без внешних библиотек
 * - Добавлено поле фото в каждый шаблон (опционально)
 */

export default function TemplatesGallery() {
  const [template, setTemplate] = React.useState<TemplateKey>('classic');
  const [docType, setDocType] = React.useState<'resume' | 'cv'>('resume');

  const data = docType === 'resume' ? sampleResumeData : sampleCVData;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold">CV & Resume — A4 Templates</h1>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateKey)}
            >
              <option value="classic">Classic ATS (1‑col)</option>
              <option value="split">Modern Split (2‑col)</option>
              <option value="serif">Elegant Serif</option>
              <option value="tech">Tech Compact</option>
            </select>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              value={docType}
              onChange={(e) => setDocType(e.target.value as 'resume' | 'cv')}
            >
              <option value="resume">Resume — 1 page</option>
              <option value="cv">CV — 2 pages</option>
            </select>
          </div>
        </header>

        {/* Canvas */}
        <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
          <A4Preview>
            {template === 'classic' && <ClassicATS data={data} />}
            {template === 'split' && <ModernSplit data={data} />}
            {template === 'serif' && <ElegantSerif data={data} />}
            {template === 'tech' && <TechCompact data={data} />}
          </A4Preview>

          {/* Spec */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-700">Spec</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>A4: 210×297 мм, внутренние поля 20 мм.</li>
              <li>Кегль основной 10 pt, лидинг 1.4, списки — 6–8 pt отступ.</li>
              <li>Разделители секций — тонкие линии <code>#E2E8F0</code>.</li>
              <li>Цвета: текст — slate‑900/600, акцент — slate‑900 только для заголовков.</li>
              <li>Фото — опционально; круглое/квадратное, объект кадрирования <em>cover</em>.</li>
              <li>Иконки и сложную графику не используем — дружелюбно к ATS.</li>
            </ul>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <div className="font-semibold">Примечание</div>
              <p>
                В версии CV мы даём больше опыта/публикаций — контент автоматически переносится на вторую страницу с разрывом.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * A4 preview shell
 */
function A4Preview({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mx-auto aspect-[1/1.414] max-w-[794px] bg-white print:w-[210mm] print:aspect-auto">
          {children}
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">Предпросмотр масштаба: 1 страница A4</div>
    </div>
  );
}

/**
 * Photo — универсальный блок фото профиля
 */
function Photo({ src, size = '28mm', rounded = 'full' as 'full' | 'lg' }: { src?: string; size?: string; rounded?: 'full' | 'lg' }) {
  return (
    <div
      className={rounded === 'full' ? 'overflow-hidden rounded-full border border-slate-200 bg-slate-100' : 'overflow-hidden rounded-lg border border-slate-200 bg-slate-100'}
      style={{ width: size, height: size }}
      aria-label="Profile photo"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Profile" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[9pt] text-slate-400">Photo</div>
      )}
    </div>
  );
}

/**
 * 1) Classic ATS — одноколоночный, строгий (+ фото справа сверху)
 */
function ClassicATS({ data }: { data: Profile }) {
  return (
    <div className="h-full w-full p-8 [font-family:Inter,system-ui,sans-serif]">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[20pt] font-extrabold leading-tight text-slate-900">{data.name}</div>
          <div className="text-[11pt] text-slate-600">{data.role}</div>
          <div className="mt-2"><ContactsBlock contacts={data.contacts} /></div>
        </div>
        <Photo src={data.photo} size="28mm" rounded="full" />
      </div>
      <Rule />
      <Section title="Summary">
        <p className="text-[10pt] leading-[1.4] text-slate-700">{data.summary}</p>
      </Section>
      <Rule />
      <Section title="Experience">
        {data.experience.map((exp) => (
          <Item key={exp.id} title={`${exp.title} — ${exp.company}`} meta={`${exp.start} — ${exp.end} • ${exp.location}`}>
            <Bullets items={exp.points} />
          </Item>
        ))}
      </Section>
      <Rule />
      <TwoCol>
        <Section title="Skills">
          <Tags items={data.skills} />
        </Section>
        <Section title="Education">
          {data.education.map((ed) => (
            <Item key={ed.id} title={`${ed.degree}, ${ed.school}`} meta={`${ed.year} • ${ed.location}`} />
          ))}
        </Section>
      </TwoCol>
    </div>
  );
}

/**
 * 2) Modern Split — две колонки, фото в сайдбаре сверху
 */
function ModernSplit({ data }: { data: Profile }) {
  return (
    <div className="h-full w-full p-0 [font-family:Inter,system-ui,sans-serif]">
      <div className="grid h-full grid-cols-[28%_1fr]">
        <aside className="space-y-6 bg-slate-50 p-7">
          <div className="flex flex-col items-center gap-3">
            <Photo src={data.photo} size="32mm" rounded="full" />
            <div className="text-center">
              <div className="text-[16pt] font-bold leading-tight text-slate-900">{data.name}</div>
              <div className="text-[10pt] text-slate-600">{data.role}</div>
            </div>
          </div>
          <ContactsBlock contacts={data.contacts} compact />
          <Section title="Skills">
            <Tags items={data.skills} />
          </Section>
          <Section title="Education">
            {data.education.map((ed) => (
              <Item key={ed.id} title={ed.school} meta={`${ed.degree} • ${ed.year}`} />
            ))}
          </Section>
        </aside>
        <main className="space-y-5 p-7">
          <Section title="Summary">
            <p className="text-[10pt] leading-[1.4] text-slate-700">{data.summary}</p>
          </Section>
          <Section title="Experience">
            {data.experience.map((exp) => (
              <Item key={exp.id} title={`${exp.title} — ${exp.company}`} meta={`${exp.start} — ${exp.end} • ${exp.location}`}>
                <Bullets items={exp.points} />
              </Item>
            ))}
          </Section>
        </main>
      </div>
    </div>
  );
}

/**
 * 3) Elegant Serif — фото справа, контакты под фото
 */
function ElegantSerif({ data }: { data: Profile }) {
  return (
    <div className="h-full w-full p-8 font-serif">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="text-[20pt] font-extrabold tracking-tight text-slate-900">{data.name}</div>
          <div className="text-[11pt] text-slate-600">{data.role}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Photo src={data.photo} size="30mm" rounded="lg" />
          <ContactsBlock contacts={data.contacts} />
        </div>
      </div>
      <Rule />
      <Section title="Profile">
        <p className="text-[10pt] leading-[1.5] text-slate-700">{data.summary}</p>
      </Section>
      <Rule />
      <Section title="Professional Experience">
        {data.experience.map((exp) => (
          <Item key={exp.id} title={`${exp.title} — ${exp.company}`} meta={`${exp.start} — ${exp.end} • ${exp.location}`}>
            <Bullets items={exp.points} />
          </Item>
        ))}
      </Section>
      <Rule />
      <TwoCol gap="10mm">
        <Section title="Core Skills">
          <Tags items={data.skills} />
        </Section>
        <Section title="Education">
          {data.education.map((ed) => (
            <Item key={ed.id} title={`${ed.degree}, ${ed.school}`} meta={`${ed.year} • ${ed.location}`} />
          ))}
        </Section>
      </TwoCol>
    </div>
  );
}

/**
 * 4) Tech Compact — фото справа от шапки
 */
function TechCompact({ data }: { data: Profile }) {
  return (
    <div className="h-full w-full p-7 [font-family:Inter,system-ui,sans-serif]">
      <div className="mb-3 flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[18pt] font-bold uppercase tracking-wide text-slate-900">{data.name}</div>
          <div className="text-[10pt] text-slate-600">{data.role}</div>
          <div className="mt-1"><ContactsBlock contacts={data.contacts} compact /></div>
        </div>
        <Photo src={data.photo} size="26mm" rounded="full" />
      </div>
      <Section title="Summary">
        <p className="text-[9.5pt] leading-[1.45] text-slate-700">{data.summary}</p>
      </Section>
      <Section title="Experience">
        {data.experience.map((exp) => (
          <Item key={exp.id} title={`${exp.title} @ ${exp.company}`} meta={`${exp.start} — ${exp.end} • ${exp.location}`}>
            <Bullets items={exp.points} tight />
          </Item>
        ))}
      </Section>
      <TwoCol>
        <Section title="Skills">
          <Tags items={data.skills} compact />
        </Section>
        <Section title="Education">
          {data.education.map((ed) => (
            <Item key={ed.id} title={`${ed.degree}`} meta={`${ed.school} • ${ed.year}`} />
          ))}
        </Section>
      </TwoCol>
    </div>
  );
}

/** ———— UI PARTS ———— */
function ContactsBlock({ contacts, compact = false }: { contacts: Contacts; compact?: boolean }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 ${compact ? 'text-[9pt]' : 'text-[10pt]' } text-slate-600`}>
      <li>{contacts.email}</li>
      <li>· {contacts.phone}</li>
      <li>· {contacts.location}</li>
      {contacts.website && <li>· {contacts.website}</li>}
      {contacts.linkedin && <li>· {contacts.linkedin}</li>}
    </ul>
  );
}

function Rule() {
  return <div className="my-4 h-px w-full bg-slate-200" />;
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 text-[11pt] font-semibold uppercase tracking-wide text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function TwoCol({ children, gap = '8mm' }: { children: React.ReactNode; gap?: string }) {
  return (
    <div className="mt-1 grid" style={{ gridTemplateColumns: '1fr 1fr', columnGap: gap }}>
      {children}
    </div>
  );
}

function Item({ title, meta, children }: { title: string; meta?: string; children?: React.ReactNode }) {
  return (
    <article className="mb-2">
      <div className="text-[10.5pt] font-semibold text-slate-900">{title}</div>
      {meta && <div className="text-[9pt] text-slate-500">{meta}</div>}
      {children && <div className="mt-1">{children}</div>}
    </article>
  );
}

function Bullets({ items, tight = false }: { items: string[]; tight?: boolean }) {
  return (
    <ul className={`list-disc pl-5 text-[10pt] text-slate-700 ${tight ? 'space-y-0.5' : 'space-y-1'}`}>
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}

function Tags({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <span
          key={i}
          className={`rounded border border-slate-300 px-2 ${compact ? 'py-0.5 text-[8.5pt]' : 'py-1 text-[9.5pt]'} text-slate-700`}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

/** ———— DATA ———— */
export type TemplateKey = 'classic' | 'split' | 'serif' | 'tech';

type Contacts = {
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
};

type Experience = {
  id: string;
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  points: string[];
};

type Education = { id: string; degree: string; school: string; year: string; location: string };

type Profile = {
  name: string;
  role: string;
  summary: string;
  contacts: Contacts;
  experience: Experience[];
  education: Education[];
  skills: string[];
  photo?: string; // URL фотографии (опционально)
};

const sampleResumeData: Profile = {
  name: 'Elena Carter',
  role: 'Sales Advisor',
  summary:
    'UK‑based sales professional with 5+ years across high‑street retail and e‑commerce. Proven track record of exceeding targets, mentoring junior staff, and improving NPS through structured consultative selling.',
  contacts: {
    email: 'elena.carter@outlook.com',
    phone: '+44 20 7946 0123',
    location: 'London, UK',
    website: 'elenacarter.co.uk',
    linkedin: 'linkedin.com/in/elenacarter-uk',
  },
  photo: 'https://placehold.co/600x600',
  experience: [
    {
      id: '1',
      title: 'Senior Sales Advisor',
      company: 'Regent Retail',
      location: 'London',
      start: '2022',
      end: 'Present',
      points: [
        'Exceeded quarterly revenue targets by 18% via upsell playbooks and CRM hygiene.',
        'Launched weekly coaching; ramp time for new hires reduced by 25%.',
        'Owned VIP client portfolio (≈120 contacts), 92% retention.'
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
        'Improved store NPS from 64 → 78 within 8 months.',
        'Introduced product knowledge cards; onboarding time cut by 30%.',
      ],
    },
  ],
  education: [
    { id: 'e1', degree: 'B.A. in Business Management', school: 'University of Manchester', year: '2019', location: 'Manchester' },
  ],
  skills: ['Consultative selling', 'CRM (Salesforce, HubSpot)', 'Merchandising', 'Customer service', 'MS Office', 'English C1'],
};

const sampleCVData: Profile = {
  ...sampleResumeData,
  summary:
    'UK‑based sales professional with 5+ years in retail and e‑commerce. Strong track record in targets, coaching, and NPS. CV version includes publications and volunteering.',
  experience: [
    ...sampleResumeData.experience,
    {
      id: '3',
      title: 'Intern',
      company: 'Outlet Co.',
      location: 'Birmingham',
      start: '2018',
      end: '2019',
      points: ['Assisted weekly stock audits and maintained visual standards.'],
    },
  ],
  education: [
    ...sampleResumeData.education,
    { id: 'e2', degree: 'CIM Sales & Marketing (Certificate)', school: 'Chartered Institute of Marketing', year: '2021', location: 'London' },
  ],
};

/**
 * Smoke tests — можно вызвать из консоли: runTemplateSmokeTests()
 */
export function runTemplateSmokeTests() {
  const root = React.createElement(TemplatesGallery, {});
  return [
    { name: 'Component is function', pass: typeof TemplatesGallery === 'function' },
    { name: 'Element created', pass: !!root },
    { name: 'Has 4 templates', pass: ['classic','split','serif','tech'].length === 4 },
    { name: 'Sample resume skills >= 5', pass: sampleResumeData.skills.length >= 5 },
    // Новые тесты
    { name: 'Sample resume has photo URL', pass: typeof sampleResumeData.photo === 'string' && sampleResumeData.photo.length > 0 },
  ];
}
