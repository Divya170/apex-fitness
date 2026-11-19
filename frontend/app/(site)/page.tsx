import Link from 'next/link';
import HeroRotator from '@/components/HeroRotator';
import { Arrow } from '@/components/Icons';
import ScheduleBoard from '@/components/ScheduleBoard';
import Ticker from '@/components/Ticker';
import { ErrorState, Lbl, Ph, Shot, Txt } from '@/components/ui';
import { load, qs } from '@/lib/api';
import type { Facility, GalleryImage, Program, ScheduleSummary, Session, SiteSettings, Testimonial, Trainer } from '@/lib/types';

const today = () => (new Date().getDay() + 6) % 7; // Monday = 0

export default async function HomePage() {
  const day = today();
  const [site, featured, programs, facilities, summary, sessions, trainers, testimonials] = await Promise.all([
    load<SiteSettings>('/site'),
    load<GalleryImage[]>('/gallery/featured'),
    load<Program[]>('/programs'),
    load<Facility[]>('/facilities'),
    load<ScheduleSummary>('/schedule/summary'),
    load<Session[]>(`/schedule${qs({ day })}`),
    load<Trainer[]>('/trainers'),
    load<Testimonial[]>('/testimonials'),
  ]);
  const s = site.data;
  const progs = programs.data ?? [];
  const facs = facilities.data ?? [];

  return (
    <>
      {/* HERO */}
      <section className="hero" aria-labelledby="hero-h">
        <HeroRotator images={featured.data ?? []} />
        <div aria-hidden="true" style={{ position: 'absolute', zIndex: 2, left: 0, top: 0, bottom: 0, width: 8, background: 'var(--orange)' }} />
        <div className="wrap hero-copy">
          <div className="stack" style={{ gap: 30, maxWidth: 860 }}>
            <p className="lbl rv">Napa, California · Fitness Club</p>
            <h1 id="hero-h" className="display rv d1">Built to move.<br /><span className="lime">Driven</span> to be <span className="stroke">stronger.</span></h1>
            <p className="lead rv d2" style={{ color: '#C9CFC9' }}>Your fitness journey starts here. Discover training, strength, and a community built around moving forward.</p>
            <div className="row stack-sm rv d3" style={{ gap: 12, marginTop: 6 }}>
              <Link className="btn btn-lime" href="/membership">Explore Membership <Arrow /></Link>
              <Link className="btn btn-line" href="/programs">Explore Programs</Link>
            </div>
          </div>
        </div>
      </section>

      <Ticker words={progs.map((p) => p.name)} />

      {/* INTRO */}
      <section id="intro" className="sec" aria-labelledby="intro-h" style={{ scrollMarginTop: 84 }}>
        <div className="wrap grid-57">
          <div className="stack sr" style={{ gap: 28 }}>
            <Lbl or>01 — The club</Lbl>
            <h2 id="intro-h" className="h1">More than<br />a <span className="lime">workout.</span></h2>
            <p className="lead">Apex Fitness Club is a fitness center in Napa, California — a place to train with purpose, whether you&apos;re stepping into a gym for the first time or chasing your next personal best.</p>
            {s?.story ? <p className="lead" style={{ whiteSpace: 'pre-line' }}>{s.story}</p> : (
              <div className="ph-box"><Ph>Club story — to be supplied</Ph><p className="phc small">[What makes Apex different, in Rachel Cooper&apos;s words — the club&apos;s atmosphere, community and approach.]</p></div>
            )}
            <Link className="arrow" href="/about">Discover Our Club <Arrow size={20} /></Link>
          </div>
          <div className="sr" style={{ position: 'relative', padding: '0 0 18% 12%' }}>
            <Shot src="/art/scene-space.svg" alt="Graphic of a training floor with a rig and mirrored wall" className="cut" style={{ aspectRatio: '4 / 3.4' }} />
            <Shot src="/art/scene-barbell.svg" className="hide-sm" placeholder={false} style={{ position: 'absolute', left: 0, bottom: 0, width: '48%', aspectRatio: '4 / 3', border: '6px solid var(--bg)' }} />
            <div aria-hidden="true" style={{ position: 'absolute', right: -14, bottom: '10%', width: 120, height: 120, border: '3px solid var(--lime)' }} />
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="sec light" aria-labelledby="pg-h">
        <div className="wrap stack" style={{ gap: 48 }}>
          <div className="between">
            <div className="stack" style={{ gap: 20, maxWidth: 720 }}><Lbl>02 — Training programs</Lbl><h2 id="pg-h" className="h1">Pick your<br />discipline.</h2></div>
            <div className="stack" style={{ gap: 14, alignItems: 'flex-start' }}>
              {progs.some((p) => p.isPlaceholder) && <Ph>Program details to be confirmed by the club</Ph>}
              <Link className="btn btn-dark" href="/programs">Explore All Programs</Link>
            </div>
          </div>
          {programs.error ? <ErrorState message="Programs couldn’t be loaded. Please refresh, or open the Programs page." /> : (
            <div className="pg">
              {progs.slice(0, 4).map((p, i) => <ProgramTile key={p.id} p={p} i={i} />)}
            </div>
          )}
        </div>
      </section>

      {/* FACILITIES */}
      {facs.length > 0 && (
        <section className="sec" aria-labelledby="fc-h">
          <div className="wrap stack" style={{ gap: 44 }}>
            <div className="between">
              <div className="stack" style={{ gap: 20 }}><Lbl or>03 — Inside Apex</Lbl><h2 id="fc-h" className="h1">Where the<br />work happens.</h2></div>
              {facs.some((f) => f.isPlaceholder) && <Ph>Facility areas &amp; photos to be confirmed</Ph>}
            </div>
            <div className="fg">
              {facs.slice(0, 4).map((f, i) => (
                <figure key={f.id} className="shot shade sr" style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="z" src={f.image} alt="" width={800} height={600} loading="lazy" />
                  <figcaption className={i === 0 ? 'h3' : 'h4'} style={{ position: 'absolute', zIndex: 2, left: 22, bottom: 20 }}>{f.name}</figcaption>
                </figure>
              ))}
            </div>
            <Link className="arrow" href="/gallery" style={{ alignSelf: 'flex-start' }}>View the gallery <Arrow size={20} /></Link>
          </div>
        </section>
      )}

      {/* SCHEDULE PREVIEW */}
      <section className="sec alt" aria-labelledby="sc-h">
        <div className="wrap grid-57" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 22 }}>
            <Lbl>04 — Weekly schedule</Lbl>
            <h2 id="sc-h" className="h1">Plan your<br />week.</h2>
            <p className="lead">Pick a day to see training sessions. The full schedule lives on the Programs page.</p>
            <Link className="arrow" href="/programs#schedule">Full schedule <Arrow size={20} /></Link>
          </div>
          {summary.data && sessions.data ? (
            <ScheduleBoard summary={summary.data} programs={progs} initialDay={day} initialSessions={sessions.data} phoneHref={s?.phoneHref} />
          ) : <ErrorState message="The schedule couldn’t be loaded right now." />}
        </div>
      </section>

      {/* TRAINERS — only when verified trainers exist */}
      {(trainers.data?.length ?? 0) > 0 && (
        <section className="sec" aria-labelledby="tr-h">
          <div className="wrap stack" style={{ gap: 40 }}>
            <div className="stack" style={{ gap: 20 }}><Lbl>Coaches</Lbl><h2 id="tr-h" className="h1">Meet the team.</h2></div>
            <div className="trainers">
              {trainers.data!.map((t) => (
                <article key={t.id} className="stack" style={{ gap: 14 }}>
                  {t.photo && <Shot src={t.photo} alt={`Portrait of ${t.name}`} placeholder={false} className="cut-s" style={{ aspectRatio: '4 / 5' }} />}
                  <h3 className="h3">{t.name}</h3>
                  {t.role && <p className="mono xs lime" style={{ letterSpacing: '.14em', textTransform: 'uppercase' }}>{t.role}</p>}
                  {t.qualifications && <p className="small muted">{t.qualifications}</p>}
                  {t.bio && <p className="small">{t.bio}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS — only consented ones */}
      {(testimonials.data?.length ?? 0) > 0 && (
        <section className="sec-s light" aria-labelledby="ts-h">
          <div className="wrap stack" style={{ gap: 32 }}>
            <h2 id="ts-h" className="lbl">From our members</h2>
            {testimonials.data!.slice(0, 2).map((q) => (
              <figure key={q.id} style={{ margin: 0 }} className="stack">
                <blockquote className="h2" style={{ margin: 0, maxWidth: 1000 }}>“{q.quote}”</blockquote>
                <figcaption className="small" style={{ marginTop: 14 }}>— {q.attribution}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* MEMBERSHIP CTA */}
      <section aria-labelledby="mc-h" className="shot" style={{ position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/scene-dumbbells.svg" alt="" width={800} height={600} loading="lazy" style={{ position: 'absolute', inset: 0 }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(17,19,18,.86)' }} />
        <div className="wrap stack" style={{ position: 'relative', zIndex: 2, gap: 32, paddingBlock: 'clamp(96px,12vw,180px)' }}>
          <Lbl or>05 — Membership</Lbl>
          <h2 id="mc-h" className="display" style={{ maxWidth: 1100 }}>Your next level <span className="lime">starts here.</span></h2>
          <div className="between" style={{ alignItems: 'center' }}>
            <p className="lead" style={{ color: '#C9CFC9' }}>Explore membership options at Apex and send a quick inquiry — the team will walk you through the details.</p>
            <Link className="btn btn-lime" href="/membership">Explore Membership <Arrow /></Link>
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', zIndex: 2, right: 0, bottom: 0, width: '34%', height: 10, background: 'var(--orange)' }} />
      </section>

      {/* CONTACT PREVIEW */}
      <section className="sec" aria-labelledby="cp-h">
        <div className="wrap grid-75" style={{ alignItems: 'end' }}>
          <div className="stack" style={{ gap: 26 }}>
            <Lbl>06 — Get in touch</Lbl>
            <h2 id="cp-h" className="h2">Questions? Talk to the club.</h2>
            {s ? (
              <div className="stack" style={{ gap: 6 }}>
                <a href={`tel:${s.phoneHref}`} className="h2" style={{ color: 'var(--lime)', textDecoration: 'none' }}>{s.phone}</a>
                <a href={`mailto:${s.email}`} style={{ font: '600 clamp(1.1rem,2vw,1.5rem) var(--fl)', color: 'var(--text)', overflowWrap: 'anywhere' }}>{s.email}</a>
              </div>
            ) : <ErrorState message="Contact details couldn’t be loaded." />}
          </div>
          <div className="stack" style={{ gap: 14, alignItems: 'flex-start' }}>
            {s && <p className="muted">{s.street}, {s.city}</p>}
            <Link className="btn btn-lime" href="/membership#inquiry">Send a Membership Inquiry</Link>
            <Link className="arrow" href="/contact">All contact options <Arrow size={20} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function ProgramTile({ p, i }: { p: Program; i: number }) {
  const href = `/programs#${p.slug}`;
  const num = String(i + 1).padStart(2, '0');
  const go = <span className="go">Explore program <Arrow /></span>;
  if (i === 3) {
    return (
      <Link className="ptile pt-d sr" href={href} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', background: 'var(--ink)', overflow: 'hidden' }}>
        <Shot src={p.image} className="hide-sm" placeholder={false} />
        <span className="stack" style={{ gap: 12, padding: 'clamp(24px,3vw,40px)', justifyContent: 'center' }}>
          <span className="num" style={{ color: 'var(--orange)' }}>{num}</span>
          <span className="h2">{p.name}</span>
          <Txt as="span" className="muted" text={p.summary} />
          {go}
        </span>
      </Link>
    );
  }
  const cls = ['pt-a', 'pt-b', 'pt-c'][i];
  return (
    <Link className={`ptile shot shade ${cls} sr`} href={href}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="z" src={p.image} alt="" width={800} height={600} loading="lazy" />
      <span className="cap">
        <span className="num">{num}</span>
        <span className={i === 0 ? 'h2' : 'h3'}>{p.name}</span>
        <Txt as="span" className={`muted ${i === 0 ? '' : 'small'}`} text={p.summary} />
        {go}
      </span>
    </Link>
  );
}
