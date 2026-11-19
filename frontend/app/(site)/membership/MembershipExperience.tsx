'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Alert } from '@/components/Icons';
import SuccessCard from '@/components/SuccessCard';
import { ErrorState, FieldError, Lbl, Ph } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import type { InquiryReceipt, Plan, Program, SiteSettings } from '@/lib/types';
import { type Errors, isBracketed, type MembershipForm, validateMembership } from '@/lib/validation';

const LABELS: Record<string, string> = { name: 'Full name', email: 'Email address', phone: 'Phone number', planId: 'Interested plan', programId: 'Preferred program', message: 'Message', consent: 'Consent' };
const empty = (planId = '', programId = ''): MembershipForm => ({ name: '', email: '', phone: '', planId, programId, message: '', consent: false, website: '' });

export default function MembershipExperience({
  plans, plansError, programs, initialPlanSlug, initialProgramSlug, site, middle,
}: {
  plans: Plan[]; plansError: boolean; programs: Program[]; initialPlanSlug: string; initialProgramSlug: string; site: SiteSettings | null; middle: ReactNode;
}) {
  const initPlan = plans.find((p) => p.slug === initialPlanSlug);
  const initProgram = programs.find((p) => p.slug === initialProgramSlug);
  const [f, setF] = useState<MembershipForm>(empty(initPlan ? String(initPlan.id) : '', initProgram ? String(initProgram.id) : ''));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<{ message: string; reference?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<(InquiryReceipt & { name: string }) | null>(null);
  const inFlight = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const clientErrors = validateMembership(f);
  const errorFor = (k: string) => serverErrors[k] ?? (attempted || touched[k] ? clientErrors[k] : undefined);
  const visible = Object.keys(LABELS).filter((k) => errorFor(k));

  const set = <K extends keyof MembershipForm>(k: K, v: MembershipForm[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (serverErrors[k]) setServerErrors(({ [k]: _d, ...rest }) => rest);
  };
  const field = (k: string, hint?: string) => ({
    id: `m-${k}`, name: k, 'aria-invalid': !!errorFor(k),
    'aria-describedby': [errorFor(k) ? `me-${k}` : '', hint ?? ''].filter(Boolean).join(' ') || undefined,
    onBlur: () => setTouched((t) => ({ ...t, [k]: true })),
  });

  const choosePlan = (id: string) => {
    set('planId', id);
    document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    setAttempted(true);
    setBanner(null);
    if (Object.keys(clientErrors).length) { requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await api<InquiryReceipt>('/membership-inquiries', {
        method: 'POST',
        body: {
          name: f.name, email: f.email, phone: f.phone || undefined,
          planId: f.planId ? Number(f.planId) : null, programId: f.programId ? Number(f.programId) : null,
          message: f.message || undefined, consent: f.consent, website: f.website || undefined,
        },
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

  const anyPlaceholder = plans.some((p) => p.isPlaceholder || p.priceLabel === null);

  return (
    <>
      {/* PLANS */}
      <section id="plans" className="sec" aria-labelledby="pl-h" style={{ scrollMarginTop: 84 }}>
        <div className="wrap stack" style={{ gap: 44 }}>
          <div className="between">
            <div className="stack" style={{ gap: 20 }}><Lbl>01 — Plans</Lbl><h2 id="pl-h" className="h1">Choose your<br />plan.</h2></div>
            <div className="stack" style={{ gap: 12, alignItems: 'flex-start', maxWidth: 420 }}>
              {anyPlaceholder && <Ph>Plan names, prices &amp; inclusions to be supplied</Ph>}
              <p className="small muted">Select a plan to pre-fill your inquiry. Pricing is only shown once confirmed by the club.</p>
            </div>
          </div>
          {plansError ? <ErrorState message="Membership plans couldn’t be loaded. You can still send an inquiry below." /> : plans.length === 0 ? (
            <div className="state"><h3 className="h3">Plans are being finalised</h3><p className="muted">Send an inquiry and the team will share membership options with you.</p></div>
          ) : (
            <div className="plans" role="group" aria-label="Membership plans">
              {plans.map((p, k) => {
                const sel = f.planId === String(p.id);
                return (
                  <article key={p.id} className={`plan ${sel ? 'sel' : ''}`} aria-labelledby={`plan-${p.id}`}>
                    <div className="between" style={{ alignItems: 'center' }}>
                      <span className="mono xs muted" style={{ letterSpacing: '.2em' }}>{String(k + 1).padStart(2, '0')}</span>
                      {sel && <span className="mono xs" style={{ letterSpacing: '.14em', color: 'var(--ink)', background: 'var(--lime)', padding: '6px 10px' }}>Selected</span>}
                    </div>
                    <h3 id={`plan-${p.id}`} className="h2" style={{ fontSize: 'clamp(2rem,3vw,2.6rem)' }}>{p.name}</h3>
                    <div className="price">
                      {p.priceLabel ? <b>{p.priceLabel}</b> : <b className="phc" style={{ fontStyle: 'normal' }}>$[—]</b>}
                      <span className={`small ${isBracketed(p.billing) || !p.billing ? 'phc' : 'muted'}`}>/ {p.billing || '[billing frequency]'}</span>
                    </div>
                    <ul>
                      {[...p.facilities, ...p.services, ...p.benefits].map((item, j) => (
                        <li key={j}><span className="lime" aria-hidden="true">+</span><span className={`small ${isBracketed(item) ? 'phc' : ''}`}>{item}</span></li>
                      ))}
                    </ul>
                    <button type="button" className={`btn ${sel ? 'btn-lime' : 'btn-line'}`} style={{ marginTop: 'auto' }} aria-pressed={sel} onClick={() => choosePlan(String(p.id))}>
                      {sel ? 'Selected — continue below' : `Ask About ${p.name.replace(/^\[|\]$/g, '')}`}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          <p className="small muted">Not sure which fits? <a href="#inquiry" onClick={() => set('planId', '')}>Send an inquiry</a> and the team will help you choose.</p>
        </div>
      </section>

      {middle}

      {/* INQUIRY FORM */}
      <section id="inquiry" className="sec alt" aria-labelledby="fq-h" style={{ scrollMarginTop: 84 }}>
        <div className="wrap fwrap">
          <div className="stack sticky" style={{ gap: 24 }}>
            <Lbl>03 — Membership inquiry</Lbl>
            <h2 id="fq-h" className="h1">Let&apos;s talk<br /><span className="lime">membership.</span></h2>
            <p className="lead">This is an inquiry, not a purchase. Nothing is charged and no membership is created — the club will contact you with details.</p>
            {site && (
              <div className="stack small" style={{ gap: 6 }}>
                <span className="muted">Prefer to call?</span>
                <a href={`tel:${site.phoneHref}`} className="h3" style={{ color: 'var(--text)', textDecoration: 'none' }}>{site.phone}</a>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg)', padding: 'clamp(24px,4vw,48px)', border: '1.5px solid var(--line)' }}>
            {receipt ? (
              <SuccessCard
                title={`Inquiry received — thanks, ${receipt.name}!`}
                reference={receipt.reference}
                actions={[{ label: 'Explore Programs', href: '/programs', primary: true }, { label: 'Visit the Gallery', href: '/gallery' }]}
                onReset={() => { setF(empty()); setTouched({}); setAttempted(false); setReceipt(null); setBanner(null); }}
                resetLabel="Send another inquiry"
              >
                <p className="small muted">
                  Plan: <b style={{ color: 'var(--text)' }}>{receipt.planName || 'Not sure yet'}</b> · Program: <b style={{ color: 'var(--text)' }}>{receipt.programName || 'Not sure yet'}</b>
                </p>
                <p className="lead" style={{ fontSize: '1.05rem' }}>The Apex team will be in touch by email{f.phone ? ' or phone' : ''} with membership details.</p>
                <p className="xs muted">This is an inquiry only — no membership has been purchased.</p>
              </SuccessCard>
            ) : (
              <form noValidate onSubmit={submit} className="form">
                <p className="small muted full">Fields marked <span className="req" aria-hidden="true">*</span> are required.</p>
                {banner && !visible.length && (
                  <div className={`notice full ${banner.reference ? 'n-warn' : 'n-err'}`} role="alert">
                    <Alert size={22} color={banner.reference ? 'var(--orange)' : 'var(--err)'} />
                    <div className="stack small" style={{ gap: 6 }}><b>{banner.message}</b>{banner.reference && <span>Earlier reference: <b>{banner.reference}</b></span>}</div>
                  </div>
                )}
                {visible.length > 0 && attempted && (
                  <div className="notice n-err err-sum full" role="alert" tabIndex={-1} ref={summaryRef}>
                    <Alert size={22} color="var(--err)" />
                    <div className="stack" style={{ gap: 6 }}>
                      <b className="h4">Check {visible.length} field{visible.length > 1 ? 's' : ''}</b>
                      <ul className="small" style={{ paddingLeft: 18 }}>{visible.map((k) => <li key={k}><a href={`#m-${k}`}>{LABELS[k]}: {errorFor(k)}</a></li>)}</ul>
                    </div>
                  </div>
                )}
                <div className="field">
                  <label className="label" htmlFor="m-name">Full name<span className="req" aria-hidden="true">*</span></label>
                  <input className="input" type="text" autoComplete="name" maxLength={120} value={f.name} onChange={(e) => set('name', e.target.value)} {...field('name')} />
                  <FieldError id="me-name" message={errorFor('name')} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="m-email">Email address<span className="req" aria-hidden="true">*</span></label>
                  <input className="input" type="email" inputMode="email" autoComplete="email" maxLength={160} value={f.email} onChange={(e) => set('email', e.target.value)} {...field('email')} />
                  <FieldError id="me-email" message={errorFor('email')} />
                </div>
                <div className="field">
                  <label className="label" htmlFor="m-phone">Phone number<span className="opt">(optional)</span></label>
                  <input className="input" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} value={f.phone} onChange={(e) => set('phone', e.target.value)} {...field('phone', 'mh-phone')} />
                  <FieldError id="me-phone" message={errorFor('phone')} />
                  <p className="hint" id="mh-phone">With area code, e.g. (707) 555-0100.</p>
                </div>
                <div className="field">
                  <label className="label" htmlFor="m-planId">Interested plan<span className="opt">(optional)</span></label>
                  <select className="input" value={f.planId} onChange={(e) => set('planId', e.target.value)} {...field('planId')}>
                    <option value="">Not sure yet — help me choose</option>
                    {plans.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                  </select>
                  <FieldError id="me-planId" message={errorFor('planId')} />
                </div>
                <div className="field full">
                  <label className="label" htmlFor="m-programId">Preferred training program<span className="opt">(optional)</span></label>
                  <select className="input" value={f.programId} onChange={(e) => set('programId', e.target.value)} {...field('programId', initProgram ? 'mh-program' : undefined)}>
                    <option value="">Not sure yet</option>
                    {programs.map((p) => <option key={p.id} value={String(p.id)}>{p.name}</option>)}
                  </select>
                  <FieldError id="me-programId" message={errorFor('programId')} />
                  {initProgram && f.programId === String(initProgram.id) && <p className="hint" id="mh-program" style={{ color: 'var(--lime)' }}>Pre-selected from the Programs page — change it anytime.</p>}
                </div>
                <div className="field full">
                  <label className="label" htmlFor="m-message">Additional message<span className="opt">(optional)</span></label>
                  <textarea className="input" rows={5} maxLength={1000} value={f.message} onChange={(e) => set('message', e.target.value)} {...field('message', 'mh-msg')} />
                  <FieldError id="me-message" message={errorFor('message')} />
                  <p className="hint" id="mh-msg">Goals, experience level or questions. {1000 - f.message.length} characters left.</p>
                </div>
                <div className="hp" aria-hidden="true"><label htmlFor="m-web">Leave empty</label><input id="m-web" type="text" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} /></div>
                <div className="field full">
                  <label className="check" htmlFor="m-consent">
                    <input type="checkbox" checked={f.consent} onChange={(e) => { set('consent', e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} {...field('consent')} />
                    <span className="small">I agree to be contacted by Apex Fitness Club about this inquiry.<span className="req" aria-hidden="true">*</span>{' '}
                      {site?.privacyUrl ? <a href={site.privacyUrl}>Privacy policy</a> : <span className="phc">[Privacy policy link — to be supplied]</span>}</span>
                  </label>
                  <FieldError id="me-consent" message={errorFor('consent')} />
                </div>
                <div className="full">
                  <button type="submit" className="btn btn-lime" disabled={submitting} aria-busy={submitting} style={{ width: '100%' }}>
                    {submitting ? <><span className="spin" aria-hidden="true" />Sending…</> : 'Submit Membership Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
