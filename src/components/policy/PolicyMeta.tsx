'use client';

import Card from '@/components/ui/Card';

interface PolicyMetaProps {
  effectiveDate?: string;
  lastUpdated?: string;
  version?: string;
  lawText?: string;
}

function MetaRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className="text-slate-500 w-24">{label}</div>
      <div className="text-slate-900 font-medium">{value || '—'}</div>
    </div>
  );
}

export default function PolicyMeta({ effectiveDate, lastUpdated, version, lawText }: PolicyMetaProps) {
  return (
    <Card className="p-6" padding="md">
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <MetaRow label="Effective" value={effectiveDate} />
        <MetaRow label="Last updated" value={lastUpdated} />
        <MetaRow label="Version" value={version} />
      </div>
      {lawText && (
        <div className="mt-3 text-xs text-slate-600">
          Governing law: {lawText}
        </div>
      )}
    </Card>
  );
}

