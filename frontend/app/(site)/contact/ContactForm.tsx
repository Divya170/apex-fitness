'use client';

import { useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/Icons';
import SuccessCard from '@/components/SuccessCard';
import { FieldError } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { MessageReceipt } from '@/lib/types';
import { type ContactFormValues, type Errors, validateContact } from '@/lib/validation';

const TOPICS = ['Membership', 'Programs', 'Personal training', 'Visiting the club', 'Something else'];
const LABELS: Record<string, string> = { name: 'Full name', email: 'Email', phone: 'Phone', topic: 'Inquiry type', message: 'Message', consent: 'Consent' };
const empty = (topic = ''): ContactFormValues => ({ name: '', email: '', phone: '', topic: TOPICS.includes(topic) ? topic : '', message: '', consent: false, website: '' });

export default function ContactForm({ initialTopic, privacyUrl }: { initialTopic: string; privacyUrl: string }) {
  const [f, setF] = useState<ContactFormValues>(empty(initialTopic));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<{ message: string; reference?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<(MessageReceipt & { name: string }) | null>(null);
  const inFlight = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const clientErrors = validateContact(f);
  const errorFor = (k: string) => serverErrors[k] ?? (attempted || touched[k] ? clientErrors[k] : undefined);
  const visible = Object.keys(LABELS).filter((k) => errorFor(k));
  const set = <K extends keyof ContactFormValues>(k: K, v: ContactFormValues[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (serverErrors[k]) setServerErrors(({ [k]: _d, ...rest }) => rest);
  };
  const field = (k: string, hint?: string) => ({
    id: `c-${k}`, name: k, 'aria-invalid': !!errorFor(k),
    'aria-describedby': [errorFor(k) ? `ce-${k}` : '', hint ?? ''].filter(Boolean).join(' ') || undefined,
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    setAttempted(true);
    setBanner(null);
    if (Object.keys(clientErrors).length) { requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await api<MessageReceipt>('/contact', {
        method: 'POST',
        body: { name: f.name, email: f.email, phone: f.phone || undefined, topic: f.topic, message: f.message, consent: f.consent, website: f.website || undefined },
      });
      setReceipt({ ...res, name: f.name });
    } catch (err) {
      if (err instanceof ApiError) {
        if (Object.keys(err.errors).length) { setServerErrors(err.errors); requestAnimationFrame(() => summaryRef.current?.focus()); }
        setBanner({ message: err.message, reference: err.reference });
      } else setBanner({ message: 'Something went wrong. Please try again.' });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (receipt) {
    return (
      <SuccessCard
        title={`Message received — thanks, ${receipt.name}!`}
        reference={receipt.reference}
        actions={[{ label: 'Explore Membership', href: '/membership', primary: true }, { label: 'See Programs', href: '/programs' }]}
        onReset={() => { setF(empty()); setTouched({}); setAttempted(false); setReceipt(null); setBanner(null); }}
        resetLabel="Write another message"
      >
        <p className="lead" style={{ fontSize: '1.05rem' }}>Your <b>{receipt.topic.toLowerCase()}</b> question is with the Apex team. We&apos;ll reply to the email you gave us.</p>
      </SuccessCard>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="form">
      <p className="small muted full">Fields marked <span className="req" aria-hidden="true">*</span> are required.</p>
      {banner && !visible.length && (
        <div className={`notice full ${banner.reference ? 'n-warn' : 'n-err'}`} role="alert">
          <Alert size={22} color={banner.reference ? 'var(--orange)' : 'var(--err)'} />
          <div className="stack small" style={{ gap: 6 }}><b>{banner.message}</b>{banner.reference && <span>Reference: <b>{banner.reference}</b></span>}</div>
        </div>
      )}
      {visible.length > 0 && attempted && (
        <div className="notice n-err err-sum full" role="alert" tabIndex={-1} ref={summaryRef}>
          <Alert size={22} color="var(--err)" />
          <div className="stack" style={{ gap: 6 }}>
            <b className="h4">Check {visible.length} field{visible.length > 1 ? 's' : ''}</b>
            <ul className="small" style={{ paddingLeft: 18 }}>{visible.map((k) => <li key={k}><a href={`#c-${k}`}>{LABELS[k]}: {errorFor(k)}</a></li>)}</ul>
          </div>
        </div>
      )}
      <div className="field">
        <label className="label" htmlFor="c-name">Full name<span className="req" aria-hidden="true">*</span></label>
        <input className="input" type="text" autoComplete="name" maxLength={120} value={f.name} onChange={(e) => set('name', e.target.value)} {...field('name')} />
        <FieldError id="ce-name" message={errorFor('name')} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-email">Email<span className="req" aria-hidden="true">*</span></label>
        <input className="input" type="email" inputMode="email" autoComplete="email" maxLength={160} value={f.email} onChange={(e) => set('email', e.target.value)} {...field('email')} />
        <FieldError id="ce-email" message={errorFor('email')} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-phone">Phone<span className="opt">(optional)</span></label>
        <input className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} {...field('phone')} />
        <FieldError id="ce-phone" message={errorFor('phone')} />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-topic">Inquiry type<span className="req" aria-hidden="true">*</span></label>
        <select className="input" value={f.topic} onChange={(e) => set('topic', e.target.value)} {...field('topic')}>
          <option value="">Choose a subject</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <FieldError id="ce-topic" message={errorFor('topic')} />
      </div>
      <div className="field full">
        <label className="label" htmlFor="c-message">Message<span className="req" aria-hidden="true">*</span></label>
        <textarea className="input" rows={6} maxLength={1500} value={f.message} onChange={(e) => set('message', e.target.value)} {...field('message', 'ch-msg')} />
        <FieldError id="ce-message" message={errorFor('message')} />
        <p className="hint" id="ch-msg">{1500 - f.message.length} characters left.</p>
      </div>
      <div className="hp" aria-hidden="true"><label htmlFor="c-web">Leave empty</label><input id="c-web" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} /></div>
      <div className="field full">
        <label className="check" htmlFor="c-consent">
          <input type="checkbox" checked={f.consent} onChange={(e) => { set('consent', e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} {...field('consent')} />
          <span className="small">I agree to be contacted by Apex Fitness Club about my message.<span className="req" aria-hidden="true">*</span>{' '}
            {privacyUrl ? <a href={privacyUrl}>Privacy policy</a> : <span className="phc">[Privacy policy link — to be supplied]</span>}</span>
        </label>
        <FieldError id="ce-consent" message={errorFor('consent')} />
      </div>
      <div className="full">
        <button type="submit" className="btn btn-lime" disabled={submitting} aria-busy={submitting} style={{ width: '100%' }}>
          {submitting ? <><span className="spin" aria-hidden="true" />Sending…</> : 'Send Message'}
        </button>
      </div>
    </form>
  );
}
