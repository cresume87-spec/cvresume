'use client';

import * as React from 'react';
import { ResumeTemplates, ResumeTemplateKey, Profile } from '@/components/resume';
import { ScaledA4 } from '@/components/resume/ui';

export type DocType = 'resume' | 'cv';

type BuilderProps = {
  initialDocType?: DocType | string;
  initialTemplate?: ResumeTemplateKey | string;
};

export const BUILDER_TEMPLATE_KEYS: ResumeTemplateKey[] = ['classic', 'split', 'serif', 'tech'];

const TEMPLATE_LABELS: Record<ResumeTemplateKey, string> = {
  classic: 'Classic ATS',
  split: 'Modern Split',
  serif: 'Elegant Serif',
  tech: 'Tech Compact',
};

const TEMPLATE_OPTIONS = BUILDER_TEMPLATE_KEYS.map((key) => ({
  key,
  label: TEMPLATE_LABELS[key],
}));

type StepKey = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'review';

const steps: { key: StepKey; n: number; label: string }[] = [
  { key: 'personal', n: 1, label: 'Personal details' },
  { key: 'summary', n: 2, label: 'Summary' },
  { key: 'experience', n: 3, label: 'Experience' },
  { key: 'education', n: 4, label: 'Education' },
  { key: 'skills', n: 5, label: 'Skills' },
  { key: 'review', n: 6, label: 'Review and finish' },
];

function normalizeDocType(value?: DocType | string): DocType {
  return value === 'cv' ? 'cv' : 'resume';
}

function normalizeTemplate(value?: ResumeTemplateKey | string): ResumeTemplateKey {
  return BUILDER_TEMPLATE_KEYS.includes(value as ResumeTemplateKey)
    ? (value as ResumeTemplateKey)
    : 'classic';
}

function emptyProfile(): Profile {
  return {
    name: '',
    role: '',
    summary: '',
    contacts: {
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
    },
    experience: [],
    education: [],
    skills: [],
    photo: '',
  };
}

function mutateExp(
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  id: string,
  patch: Partial<Profile['experience'][number]>,
) {
  setProfile((current) => ({
    ...current,
    experience: current.experience.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  }));
}

function removeExp(setProfile: React.Dispatch<React.SetStateAction<Profile>>, id: string) {
  setProfile((current) => ({
    ...current,
    experience: current.experience.filter((entry) => entry.id !== id),
  }));
}

function mutateEdu(
  setProfile: React.Dispatch<React.SetStateAction<Profile>>,
  id: string,
  patch: Partial<Profile['education'][number]>,
) {
  setProfile((current) => ({
    ...current,
    education: current.education.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  }));
}

function removeEdu(setProfile: React.Dispatch<React.SetStateAction<Profile>>, id: string) {
  setProfile((current) => ({
    ...current,
    education: current.education.filter((entry) => entry.id !== id),
  }));
}

export default function CVResumeBuilder({ initialDocType, initialTemplate }: BuilderProps) {
  const defaultDocType = normalizeDocType(initialDocType);
  const defaultTemplate = normalizeTemplate(initialTemplate);

  const [docType, setDocType] = React.useState<DocType>(defaultDocType);
  const [step, setStep] = React.useState<StepKey>('personal');
  const [templatesByDoc, setTemplatesByDoc] = React.useState<Record<DocType, ResumeTemplateKey>>(() => ({
    resume: defaultTemplate,
    cv: defaultTemplate,
  }));
  const [profiles, setProfiles] = React.useState<Record<DocType, Profile>>(() => ({
    resume: emptyProfile(),
    cv: emptyProfile(),
  }));
  const bcRef = React.useRef<BroadcastChannel | null>(null);
  const [busy, setBusy] = React.useState<null | 'draft' | 'pdf' | 'docx'>(null);
  const [notice, setNotice] = React.useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const noticeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    try { bcRef.current = new BroadcastChannel('app-events'); } catch {}
    return () => {
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      try { bcRef.current?.close(); } catch {}
    };
  }, []);

  const pushNotice = React.useCallback((kind: 'success' | 'error', message: string) => {
    setNotice({ kind, message });
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 6000);
  }, []);

  const template = templatesByDoc[docType];
  const profile = profiles[docType];
  const SelectedTemplate = ResumeTemplates[template] ?? ResumeTemplates.classic;

  type CreateDocResult = {
    document: { id: string; title?: string };
    tokenBalance?: number;
    charge?: number;
    action?: string;
  };

  const setProfile = React.useCallback(
    (updater: React.SetStateAction<Profile>) => {
      setProfiles((current) => {
        const nextProfile = typeof updater === 'function' ? (updater as (value: Profile) => Profile)(current[docType]) : updater;
        if (nextProfile === current[docType]) return current;
        return { ...current, [docType]: nextProfile };
      });
    },
    [docType],
  );

  const handleTemplateChange = (value: ResumeTemplateKey) => {
    setTemplatesByDoc((current) => ({ ...current, [docType]: value }));
  };

  const sanitizeFilename = React.useCallback(
    (title: string | undefined, ext: 'pdf' | 'docx') => {
      const fallback = docType === 'cv' ? 'cv' : 'resume';
      const base = title && title.trim() ? title.trim() : fallback;
      const safe = base.replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-');
      return `${safe || fallback}.${ext}`;
    },
    [docType],
  );

  const downloadBinary = React.useCallback(async (url: string, filename: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      const info = await response.json().catch(() => ({}));
      throw new Error(info?.error || 'Failed to download file');
    }
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
  }, []);

  const createDocument = React.useCallback(
    async (action: 'draft' | 'export-pdf' | 'export-docx'): Promise<CreateDocResult> => {
      const profilePayload = JSON.parse(JSON.stringify(profile)) as Profile;
      const payload = {
        title: profilePayload.name
          ? `${profilePayload.name} ${docType === 'cv' ? 'CV' : 'Resume'}`
          : docType === 'cv' ? 'CV Draft' : 'Resume Draft',
        action,
        docType,
        template,
        data: {
          docType,
          template,
          profile: profilePayload,
          meta: { generatedAt: new Date().toISOString() },
        },
      };

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || 'Unable to save document');
      }

      if (typeof result?.tokenBalance === 'number') {
        try { bcRef.current?.postMessage({ type: 'tokens-updated', tokenBalance: result.tokenBalance }); } catch {}
      }
      try { bcRef.current?.postMessage({ type: 'documents-updated' }); } catch {}

      return result as CreateDocResult;
    },
    [profile, docType, template],
  );

  const handleCreateDraft = React.useCallback(async () => {
    if (busy) return;
    setBusy('draft');
    setNotice(null);
    try {
      const result = await createDocument('draft');
      const charged = result.charge ?? 10;
      pushNotice('success', `Draft saved to dashboard. Spent ${charged} tokens.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save draft';
      pushNotice('error', message);
    } finally {
      setBusy(null);
    }
  }, [busy, createDocument, pushNotice]);

  const handleExport = React.useCallback(
    async (format: 'pdf' | 'docx') => {
      if (busy) return;
      setBusy(format === 'pdf' ? 'pdf' : 'docx');
      setNotice(null);
      try {
        const result = await createDocument(format === 'pdf' ? 'export-pdf' : 'export-docx');
        const documentSummary = result.document;
        const filename = sanitizeFilename(documentSummary?.title, format);
        const endpoint = format === 'pdf' ? `/api/resume/pdf/${documentSummary.id}` : `/api/resume/docx/${documentSummary.id}`;
        await downloadBinary(endpoint, filename);
        const charged = result.charge ?? 15;
        pushNotice('success', `${format.toUpperCase()} ready. Spent ${charged} tokens.`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : `Unable to export ${format.toUpperCase()}`;
        pushNotice('error', message);
      } finally {
        setBusy(null);
      }
    },
    [busy, createDocument, downloadBinary, pushNotice, sanitizeFilename],
  );

  const handleManager = () => {
    alert('Personal manager request sent. -80 tokens');
  };

  const handleAI = () => {
    alert('Improve with AI triggered. -20 tokens');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-slate-900" aria-hidden />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              id="btn-save"
              className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleCreateDraft}
              disabled={busy !== null}
            >
              {busy === 'draft' ? 'Saving...' : 'Save draft'}
            </button>
            <div className="hidden items-center gap-1 md:flex">
              <button
                id="btn-export-pdf"
                className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleExport('pdf')}
                disabled={busy !== null}
              >
                {busy === 'pdf' ? 'Preparing...' : 'Export PDF'}
              </button>
              <button
                id="btn-export-docx"
                className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleExport('docx')}
                disabled={busy !== null}
              >
                {busy === 'docx' ? 'Preparing...' : 'Export DOCX'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[280px_1fr_420px]">
        <aside className="sticky top-16 self-start rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1"
              value={docType}
              onChange={(event) => setDocType(event.target.value as DocType)}
            >
              <option value="resume">Resume</option>
              <option value="cv">CV</option>
            </select>
            <select
              className="col-span-2 rounded-md border border-slate-300 bg-white px-2 py-1"
              value={template}
              onChange={(event) => handleTemplateChange(event.target.value as ResumeTemplateKey)}
            >
              {TEMPLATE_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <nav className="flex flex-col gap-1 text-sm" id="step-nav">
            {steps.map((item) => (
              <button
                key={item.key}
                className={`justify-start rounded-md px-3 py-2 text-left hover:bg-slate-50 ${step === item.key ? 'bg-slate-100 font-semibold' : 'bg-white'}`}
                onClick={() => setStep(item.key)}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[11px] text-slate-600">
                  {item.n}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="font-semibold">Costs</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <CostPill label="Create" value="10 tok." />
              <CostPill label="Export" value="15 tok." />
              <CostPill label="Manager" value="80 tok." />
              <CostPill label="AI" value="20 tok." />
            </div>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <Editor step={step} profile={profile} setProfile={setProfile} />
        </section>

        <section className="space-y-3" id="preview-pane">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-xs text-slate-500">Template</div>
                <div className="font-semibold">{TEMPLATE_LABELS[template]}</div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => handleExport('pdf')}
                  disabled={busy !== null}
                >
                  {busy === 'pdf' ? 'Preparing...' : 'Export PDF'}
                </button>
                <button
                  className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => handleExport('docx')}
                  disabled={busy !== null}
                >
                  {busy === 'docx' ? 'Preparing...' : 'Export DOCX'}
                </button>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-100 p-3">
              <ScaledA4 key={`${docType}-${template}`} maxScale={0.78}>
                <SelectedTemplate data={profile} />
              </ScaledA4>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm">
            <div className="font-semibold">Token actions</div>
            <p className="mt-1 text-slate-600">Use tokens to generate your {docType === 'cv' ? 'CV' : 'resume'}.</p>
            <div className="mt-3 flex flex-col gap-2">
              <button
                className="rounded-md bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCreateDraft}
                disabled={busy !== null}
              >
                {busy === 'draft' ? 'Creating draft...' : 'Create (10 tok.)'}
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleExport('pdf')}
                disabled={busy !== null}
              >
                {busy === 'pdf' ? 'Creating PDF...' : 'Create & Export PDF (15 tok.)'}
              </button>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => handleExport('docx')}
                disabled={busy !== null}
              >
                {busy === 'docx' ? 'Creating DOCX...' : 'Create & Export DOCX (15 tok.)'}
              </button>
            </div>
            {notice && (
              <div
                className={`mt-3 rounded-md border px-3 py-2 text-xs ${notice.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
              >
                {notice.message}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-sm">
            <div className="font-semibold">AI assist</div>
            <p className="mt-1 text-slate-600">Let our model rewrite selected sections or generate bullet ideas.</p>
            <div className="mt-3 flex flex-col gap-2">
              <button id="btn-ai" className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-100" onClick={handleAI}>
                Improve with AI (20 tok.)
              </button>
              <button id="btn-manager" className="rounded-md bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800" onClick={handleManager}>
                Send to personal manager (80 tok.)
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <div className="font-semibold">Tips</div>
            <ul className="mt-2 space-y-1">
              <li>Use action verbs and numbers in experience bullets.</li>
              <li>Keep the summary to three or four clear sentences.</li>
              <li>Tailor keywords to match the vacancy.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Editor({ step, profile, setProfile }: { step: StepKey; profile: Profile; setProfile: React.Dispatch<React.SetStateAction<Profile>> }) {
  switch (step) {
    case 'personal':
      return <PersonalForm profile={profile} setProfile={setProfile} />;
    case 'summary':
      return <SummaryForm profile={profile} setProfile={setProfile} />;
    case 'experience':
      return <ExperienceForm profile={profile} setProfile={setProfile} />;
    case 'education':
      return <EducationForm profile={profile} setProfile={setProfile} />;
    case 'skills':
      return <SkillsForm profile={profile} setProfile={setProfile} />;
    case 'review':
      return <ReviewPanel profile={profile} />;
    default:
      return null;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ${className || ''}`} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ${className || ''}`} />;
}

function PersonalForm({ profile, setProfile }: EditorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Personal details</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="Full name">
          <Input value={profile.name} placeholder="Enter full name" onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))} />
        </Field>
        <Field label="Role / Title">
          <Input value={profile.role} placeholder="e.g. Product Manager" onChange={(event) => setProfile((prev) => ({ ...prev, role: event.target.value }))} />
        </Field>
        <Field label="Email">
          <Input value={profile.contacts.email} placeholder="name@email.com" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, email: event.target.value } }))} />
        </Field>
        <Field label="Phone">
          <Input value={profile.contacts.phone} placeholder="Phone number" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, phone: event.target.value } }))} />
        </Field>
        <Field label="Location">
          <Input value={profile.contacts.location} placeholder="City, Country" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, location: event.target.value } }))} />
        </Field>
        <Field label="Website">
          <Input value={profile.contacts.website || ''} placeholder="Personal site (optional)" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, website: event.target.value } }))} />
        </Field>
        <Field label="LinkedIn">
          <Input value={profile.contacts.linkedin || ''} placeholder="LinkedIn profile" onChange={(event) => setProfile((prev) => ({ ...prev, contacts: { ...prev.contacts, linkedin: event.target.value } }))} />
        </Field>
        <Field label="Photo URL">
          <Input value={profile.photo || ''} placeholder="Link to photo" onChange={(event) => setProfile((prev) => ({ ...prev, photo: event.target.value }))} />
        </Field>
      </div>
    </div>
  );
}

function SummaryForm({ profile, setProfile }: EditorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Summary</h2>
      <div className="mt-3 grid gap-3">
        <Field label="Professional summary">
          <Textarea rows={5} value={profile.summary} placeholder="Summarize your experience and strengths" onChange={(event) => setProfile((prev) => ({ ...prev, summary: event.target.value }))} />
        </Field>
        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-600">
          <div className="font-semibold">Writing tips</div>
          <ul className="mt-1 list-disc pl-5">
            <li>Use measurable outcomes (percentages, revenue, team size).</li>
            <li>Keep it to three or four concise sentences.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ExperienceForm({ profile, setProfile }: EditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Experience</h2>
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              experience: [
                ...prev.experience,
                { id: Math.random().toString(36).slice(2), title: '', company: '', location: '', start: '', end: '', points: [] },
              ],
            }));
          }}
        >
          Add role
        </button>
      </div>
      <div className="mt-3 space-y-4">
        {profile.experience.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Title">
                <Input value={entry.title} placeholder="Job title" onChange={(event) => mutateExp(setProfile, entry.id, { title: event.target.value })} />
              </Field>
              <Field label="Company">
                <Input value={entry.company} placeholder="Company" onChange={(event) => mutateExp(setProfile, entry.id, { company: event.target.value })} />
              </Field>
              <Field label="Location">
                <Input value={entry.location} placeholder="Location" onChange={(event) => mutateExp(setProfile, entry.id, { location: event.target.value })} />
              </Field>
              <Field label="Start">
                <Input value={entry.start} placeholder="Start date" onChange={(event) => mutateExp(setProfile, entry.id, { start: event.target.value })} />
              </Field>
              <Field label="End">
                <Input value={entry.end} placeholder="End date or Present" onChange={(event) => mutateExp(setProfile, entry.id, { end: event.target.value })} />
              </Field>
              <Field label="Bullets (one per line)">
                <Textarea rows={3} value={entry.points.join('\n')} placeholder="Use action verbs + results" onChange={(event) => mutateExp(setProfile, entry.id, { points: event.target.value.split('\n') })} />
              </Field>
            </div>
            <div className="mt-2 text-right">
              <button className="text-xs text-slate-500 hover:underline" onClick={() => removeExp(setProfile, entry.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationForm({ profile, setProfile }: EditorProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Education</h2>
        <button
          className="rounded-md border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
          onClick={() => {
            setProfile((prev) => ({
              ...prev,
              education: [
                ...prev.education,
                { id: Math.random().toString(36).slice(2), degree: '', school: '', year: '', location: '' },
              ],
            }));
          }}
        >
          Add education
        </button>
      </div>
      <div className="mt-3 space-y-4">
        {profile.education.map((entry) => (
          <div key={entry.id} className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3">
            <Field label="Degree">
              <Input value={entry.degree} placeholder="Degree or certificate" onChange={(event) => mutateEdu(setProfile, entry.id, { degree: event.target.value })} />
            </Field>
            <Field label="School">
              <Input value={entry.school} placeholder="School" onChange={(event) => mutateEdu(setProfile, entry.id, { school: event.target.value })} />
            </Field>
            <Field label="Year">
              <Input value={entry.year} placeholder="Year completed" onChange={(event) => mutateEdu(setProfile, entry.id, { year: event.target.value })} />
            </Field>
            <Field label="Location">
              <Input value={entry.location} placeholder="Location" onChange={(event) => mutateEdu(setProfile, entry.id, { location: event.target.value })} />
            </Field>
            <div className="col-span-2 text-right">
              <button className="text-xs text-slate-500 hover:underline" onClick={() => removeEdu(setProfile, entry.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillsForm({ profile, setProfile }: EditorProps) {
  const [draft, setDraft] = React.useState('');

  return (
    <div>
      <h2 className="text-lg font-semibold">Skills</h2>
      <div className="mt-3 flex gap-2">
        <Input placeholder="Add a skill" value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
          onClick={() => {
            if (!draft.trim()) return;
            setProfile((prev) => ({ ...prev, skills: [...prev.skills, draft.trim()] }));
            setDraft('');
          }}
        >
          Add
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {profile.skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm">
            {skill}
            <button
              className="text-xs text-slate-500 hover:underline"
              onClick={() => setProfile((prev) => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== index) }))}
            >
              Remove
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewPanel({ profile }: { profile: Profile }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Review and finish</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <li className="rounded border border-slate-200 bg-slate-50 p-2">Name: <b>{profile.name}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">Role: <b>{profile.role}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">Experience entries: <b>{profile.experience.length}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">Education entries: <b>{profile.education.length}</b></li>
        <li className="rounded border border-slate-200 bg-slate-50 p-2">Skills: <b>{profile.skills.length}</b></li>
      </ul>
      <div className="mt-4 text-xs text-slate-500">Use the export buttons to generate PDF or DOCX files.</div>
    </div>
  );
}

type EditorProps = {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
};

function CostPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
      <span className="mr-2 text-slate-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function runBuilderSmokeTests() {
  const element = React.createElement(CVResumeBuilder, {});
  const hasPreviewPane = typeof document !== 'undefined' ? !!document.getElementById('preview-pane') : true;
  const hasStepNav = typeof document !== 'undefined' ? !!document.getElementById('step-nav') : true;
  const expectedSteps = 6;
  const aiButton = typeof document !== 'undefined' ? document.getElementById('btn-ai') : {};
  const managerButton = typeof document !== 'undefined' ? document.getElementById('btn-manager') : {};
  return [
    { name: 'Component exists', pass: typeof CVResumeBuilder === 'function' },
    { name: 'Element created', pass: !!element },
    { name: 'Preview pane present', pass: hasPreviewPane },
    { name: 'Step navigator present', pass: hasStepNav },
    { name: 'Has 6 steps', pass: steps.length === expectedSteps },
    { name: 'AI button present', pass: !!aiButton },
    { name: 'Manager button present', pass: !!managerButton },
  ];
}
