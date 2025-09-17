'use client';

import React, { useRef } from 'react';

interface LogoUploaderProps {
  value: string | null | undefined;
  onChange: (dataUrl: string | null) => void;
}

export default function LogoUploader({ value, onChange }: LogoUploaderProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const onPick = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      onChange(dataUrl);
    };
    reader.readAsDataURL(f);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const clear = () => onChange(null);

  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-28 rounded-lg border border-[#E2E8F0] bg-white overflow-hidden flex items-center justify-center">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Logo" className="max-h-10 max-w-[104px] object-contain" />
        ) : (
          <div className="text-xs text-slate-500">No logo</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onPick} className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm">Upload</button>
        {value && (
          <button type="button" onClick={clear} className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm">Remove</button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </div>
  );
}
