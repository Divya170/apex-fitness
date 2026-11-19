'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { api, ApiError, qs } from '@/lib/api';
import type { Program, ScheduleSummary, Session } from '@/lib/types';
import { formatTime } from '@/lib/validation';
import { Calendar } from './Icons';
import { ErrorState } from './ui';

/** Weekly schedule: day selector (+ program filter in "full" mode), loaded from GET /api/schedule. */
export default function ScheduleBoard({
  summary, programs, initialDay, initialSessions, full = false, phoneHref,
}: {
  summary: ScheduleSummary; programs: Program[]; initialDay: number; initialSessions: Session[]; full?: boolean; phoneHref?: string;
}) {
  const [day, setDay] = useState(initialDay);
  const [program, setProgram] = useState('');
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api<Session[]>(`/schedule${qs({ day, program })}`, { signal: ctrl.signal })
      .then(setSessions)
      .catch((e) => { if (e.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load the schedule.'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [day, program, reload]);

  const dayName = summary.days[day]?.name ?? '';
  const progName = programs.find((p) => p.slug === program)?.name;
  const scope = `${dayName}${progName ? ` · ${progName}` : ''}`;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="days" role="group" aria-label="Choose a day">
        {summary.days.map((d) => (
          <button key={d.day} type="button" aria-pressed={day === d.day} onClick={() => setDay(d.day)} aria-label={`${d.name}, ${d.count} session${d.count === 1 ? '' : 's'}`}>
            <span>{d.name.slice(0, 3)}</span><b>{String(d.day + 1).padStart(2, '0')}</b>
            {summary.total > 0 && <small>{d.count} sess.</small>}
          </button>
        ))}
      </div>
      {full && summary.total > 0 && (
        <div className="chips scroll" role="group" aria-label="Filter by program">
          <button type="button" className="chip" aria-pressed={!program} onClick={() => setProgram('')}>All programs</button>
          {programs.map((p) => <button key={p.slug} type="button" className="chip" aria-pressed={program === p.slug} onClick={() => setProgram(p.slug)}>{p.name}</button>)}
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite">{loading ? 'Loading sessions…' : `${scope}: ${sessions.length} session${sessions.length === 1 ? '' : 's'}`}</p>

      {error ? (
        <ErrorState message={error} action={<button type="button" className="arrow" onClick={() => setReload((n) => n + 1)}>Try again</button>} />
      ) : sessions.length > 0 ? (
        <div className={loading ? 'busy' : ''} aria-busy={loading}>
          {sessions.map((s) => (
            <div key={s.id} className="sess" style={full ? undefined : { gridTemplateColumns: '150px 1fr auto' }}>
              <span className="h3 lime" style={{ fontSize: '1.4rem' }}>{formatTime(s.startTime)}{s.endTime ? <span className="muted" style={{ fontSize: '.9rem' }}> – {formatTime(s.endTime)}</span> : null}</span>
              <div className="stack" style={{ gap: 4 }}>
                <b className="h4">{s.title}</b>
                {s.programName && <span className="xs muted">{s.programName}</span>}
              </div>
              {full && <span className="small muted">{[s.level, s.coach && `Coach: ${s.coach}`].filter(Boolean).join(' · ')}</span>}
              <span className="xs muted">{s.info}</span>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="stack" style={{ gap: 10 }} aria-hidden="true">{[0, 1, 2].map((k) => <div key={k} className="skeleton" style={{ height: 70 }} />)}</div>
      ) : (
        <div className="state">
          <Calendar color="var(--lime)" />
          <h3 className="h3">{summary.total === 0 ? 'Training schedule coming soon' : `No sessions on ${scope}`}</h3>
          <p className="muted">
            {summary.total === 0
              ? `Sessions for ${dayName} haven’t been published yet. Contact the club for current class times.`
              : 'Try another day or program — or ask the club about session times.'}
          </p>
          <div className="row stack-sm">
            <Link className="btn btn-lime btn-sm" href="/contact#form">Ask About Times</Link>
            {phoneHref && <a className="btn btn-line btn-sm" href={`tel:${phoneHref}`}>Call the Club</a>}
          </div>
        </div>
      )}
    </div>
  );
}
