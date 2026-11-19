'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '@/components/Icons';
import { ApiError } from '@/lib/api';
import type { SiteSettings } from '@/lib/types';
import type { Call } from './AdminApp';

const FIELDS: { key: keyof SiteSettings; label: string; hint?: string }[] = [
  { key: 'name', label: 'Club name' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'phone', label: 'Phone (as displayed)' },
  { key: 'phoneHref', label: 'Phone (for tap-to-call)', hint: 'Digits with country code, e.g. +13096576728' },
  { key: 'email', label: 'Email' },
  { key: 'street', label: 'Street address' },
  { key: 'city', label: 'City, state & ZIP' },
  { key: 'country', label: 'Country' },
  { key: 'mapQuery', label: 'Map search text', hint: 'Used for the map embed and directions links.' },
  { key: 'story', label: 'Club story (Home & About)', hint: 'Approved text from the club. Leave empty to show the placeholder.' },
  { key: 'privacyUrl', label: 'Privacy policy link', hint: 'Shown next to the consent checkboxes once added.' },
];

export default function SettingsForm({ call }: { call: Call }) {
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    call<SiteSettings>('/site')
      .then((s) => setForm(Object.fromEntries(FIELDS.map((f) => [f.key, String(s[f.key] ?? '')]))))
      .catch((e) => setStatus({ ok: false, text: e.message }));
  }, [call]);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setStatus(null);
    try {
      await call('/admin/site', { method: 'PUT', body: form });
      setErrors({});
      setStatus({ ok: true, text: 'Site details saved. The website shows them immediately.' });
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.errors);
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'Save failed.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 820 }}>
      <h1 className="h2">Site details</h1>
      {status && (
        <div className={`notice ${status.ok ? 'n-ok' : 'n-err'}`} role={status.ok ? 'status' : 'alert'}>
          {!status.ok && <Alert color="var(--err-l)" />}<p className="small">{status.text}</p>
        </div>
      )}
      {!form ? (
        <div className="skeleton" style={{ height: 320 }} />
      ) : (
        <form onSubmit={save} noValidate className="form" style={{ padding: 28, background: '#fff', border: '1px solid #DDE1DA' }}>
          {FIELDS.map((f) => (
            <div key={f.key} className="field">
              <label className="label" htmlFor={`st-${f.key}`}>{f.label}</label>
              {f.key === 'story' ? <textarea id={`st-${f.key}`} className="input" rows={6} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} /> : <input id={`st-${f.key}`} className="input" value={form[f.key]} aria-invalid={!!errors[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />}
              {errors[f.key] ? <p className="err">{errors[f.key]}</p> : f.hint && <p className="hint">{f.hint}</p>}
            </div>
          ))}
          <div className="full"><button type="submit" className="btn btn-dark" disabled={saving}>{saving ? 'Saving…' : 'Save site details'}</button></div>
        </form>
      )}
    </div>
  );
}
