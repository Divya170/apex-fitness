'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { Check } from './Icons';

export interface NextAction { label: string; href: string; primary?: boolean }

/** Confirmation after a successful submission: reference number plus clear next actions. */
export default function SuccessCard({ title, reference, children, actions, onReset, resetLabel }: {
  title: string; reference: string; children?: ReactNode; actions: NextAction[]; onReset: () => void; resetLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div ref={ref} tabIndex={-1} className="stack" style={{ gap: 22, outline: 'none' }} role="status" aria-live="polite">
      <span style={{ width: 64, height: 64, display: 'grid', placeItems: 'center', background: 'var(--lime)', color: 'var(--ink)' }}><Check /></span>
      <h3 className="h2" style={{ fontSize: 'clamp(2rem,3.4vw,3rem)' }}>{title}</h3>
      <div className="stack" style={{ gap: 6 }}>
        <span className="mono xs muted" style={{ letterSpacing: '.16em', textTransform: 'uppercase' }}>Your reference</span>
        <span className="ref">{reference}</span>
      </div>
      {children}
      <div className="row stack-sm">
        {actions.map((a) => <Link key={a.label} className={`btn ${a.primary ? 'btn-lime' : 'btn-line'}`} href={a.href}>{a.label}</Link>)}
      </div>
      <button type="button" className="arrow" style={{ alignSelf: 'flex-start' }} onClick={onReset}>{resetLabel}</button>
    </div>
  );
}
