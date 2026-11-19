import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/Icons';
import ScheduleBoard from '@/components/ScheduleBoard';
import { ErrorState, Lbl, Ph, Shot, Txt } from '@/components/ui';
import { load, qs } from '@/lib/api';
import type { Program, ScheduleSummary, Session, SiteSettings } from '@/lib/types';
import { isBracketed } from '@/lib/validation';

export const metadata: Metadata = { title: 'Programs', description: 'Strength training, cardio, group classes and personal training at Apex Fitness Club in Napa.' };

const SURFACES = ['', 'light', '', 'alt'];

export default async function ProgramsPage() {
  const day = (new Date().getDay() + 6) % 7;
  const [programs, summary, sessions, site] = await Promise.all([
    load<Program[]>('/programs'),
    load<ScheduleSummary>('/schedule/summary'),
    load<Session[]>(`/schedule${qs({ day })}`),
    load<SiteSettings>('/site'),
  ]);
  const progs = programs.data ?? [];

  return (
    <>
      <section className="p-hero shot" aria-labelledby="ph-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="kb" src="/art/scene-space.svg" alt="Graphic of a training floor" width={800} height={600} style={{ position: 'absolute', inset: 0 }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,19,18,.55) 0%, rgba(17,19,18,.95) 78%)' }} />
        <span className="pt">Photo placeholder</span>
        <div className="wrap stack" style={{ position: 'relative', zIndex: 2, gap: 28, paddingTop: 180, paddingBottom: 72 }}>
          <p className="lbl rv">Training programs</p>
          <h1 id="ph-h" className="display rv d1">Find your way<br />to <span className="lime">stronger.</span></h1>
          <p className="lead rv d2" style={{ color: '#C9CFC9' }}>{progs.length ? `${progs.length} ways to train at Apex.` : 'Ways to train at Apex.'} Explore each program, check the weekly schedule, and ask the team which one fits your goals.</p>
          <nav aria-label="Jump to a program" className="chips scroll rv d3">
            {progs.map((p, i) => <a key={p.slug} className="chip" href={`#${p.slug}`}>{String(i + 1).padStart(2, '0')} {p.name}</a>)}
            <a className="chip" href="#schedule">Schedule</a>
          </nav>
        </div>
      </section>

      {progs.some((p) => p.isPlaceholder) && (
        <div className="wrap" style={{ paddingTop: 28 }}><Ph>Program details below are pending confirmation by the club — no formats, durations or outcomes are invented</Ph></div>
      )}

      {programs.error ? (
        <div className="wrap sec"><ErrorState message="Programs couldn’t be loaded right now. Please refresh the page." /></div>
      ) : progs.length === 0 ? (
        <div className="wrap sec"><div className="state"><h2 className="h3">Programs are coming soon</h2><p className="muted">Ask the club what&apos;s available right now.</p><Link className="btn btn-lime btn-sm" href="/contact#form">Contact the Club</Link></div></div>
      ) : (
        progs.map((p, i) => {
          const surface = SURFACES[i % SURFACES.length];
          const light = surface === 'light';
          const num = String(i + 1).padStart(2, '0');
          return (
            <section key={p.id} id={p.slug} className={`sec ${surface}`} aria-labelledby={`p-${p.slug}`} style={{ scrollMarginTop: 84 }}>
              <div className={`wrap prog ${i % 2 ? 'flip' : ''}`}>
                <div className="media sr">
                  <span className={`idx ${p.accent === 'orange' ? 'or' : ''}`} aria-hidden="true">{num}</span>
                  <Shot src={p.image} alt={`Graphic representing ${p.name}`} className="cut" style={{ aspectRatio: '4 / 3' }} placeholder={p.isPlaceholder} />
                </div>
                <div className="copy stack sr" style={{ gap: 22 }}>
                  <Lbl or={p.accent === 'orange'}>Program {num}</Lbl>
                  <h2 id={`p-${p.slug}`} className="h1">{p.name}</h2>
                  <Txt className="lead" text={p.summary} />
                  {p.details && (isBracketed(p.details)
                    ? <div className="ph-box"><Ph /><p className="phc small">{p.details}</p></div>
                    : <p style={{ whiteSpace: 'pre-line' }}>{p.details}</p>)}
                  {p.benefits.length > 0 && (
                    <ul className="benefit-list">{p.benefits.map((b) => <li key={b}><span className={light ? '' : 'lime'} aria-hidden="true">+</span>{b}</li>)}</ul>
                  )}
                  <Link className={`btn ${light ? 'btn-dark' : 'btn-lime'}`} href={`/membership?program=${p.slug}#inquiry`}>Ask About {p.name}</Link>
                </div>
              </div>
            </section>
          );
        })
      )}

      {progs.length > 0 && progs.length <= 4 && (
        <section className="sec-s" aria-labelledby="p-more" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="wrap between" style={{ alignItems: 'center' }}>
            <div className="stack" style={{ gap: 12 }}><Lbl or>More programs</Lbl><h2 id="p-more" className="h3">Other confirmed programs</h2></div>
            <p className="phc" style={{ maxWidth: '52ch' }}>[Any additional programs Apex confirms will appear here with their own showcase.]</p>
          </div>
        </section>
      )}

      <section id="schedule" className="sec" aria-labelledby="sc-h" style={{ scrollMarginTop: 84 }}>
        <div className="wrap stack" style={{ gap: 36 }}>
          <div className="stack" style={{ gap: 20 }}><Lbl>Weekly schedule</Lbl><h2 id="sc-h" className="h1">Training<br />schedule.</h2></div>
          {summary.data && sessions.data
            ? <ScheduleBoard full summary={summary.data} programs={progs} initialDay={day} initialSessions={sessions.data} phoneHref={site.data?.phoneHref} />
            : <ErrorState message="The schedule couldn’t be loaded right now." />}
        </div>
      </section>

      <section className="light" aria-labelledby="pc-h" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="wrap between" style={{ paddingBlock: 'clamp(80px,10vw,140px)', alignItems: 'center' }}>
          <h2 id="pc-h" className="display" style={{ fontSize: 'clamp(3rem,8vw,7.6rem)' }}>Ready to start<br />training?</h2>
          <div className="stack" style={{ gap: 14, alignItems: 'flex-start' }}>
            <Link className="btn btn-dark" href="/contact?topic=Programs#form">Ask About Our Programs <Arrow /></Link>
            <Link className="arrow" href="/membership">Or explore membership <Arrow size={20} /></Link>
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, bottom: 0, width: '40%', height: 10, background: 'var(--orange)' }} />
      </section>
    </>
  );
}
