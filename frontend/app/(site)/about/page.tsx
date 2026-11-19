import type { Metadata } from 'next';
import Link from 'next/link';
import { Arrow } from '@/components/Icons';
import { ErrorState, Lbl, Ph, Txt } from '@/components/ui';
import { load } from '@/lib/api';
import type { Facility, SiteSettings } from '@/lib/types';

export const metadata: Metadata = { title: 'About', description: 'About Apex Fitness Club, a fitness center on River Avenue in Napa, California.' };

export default async function AboutPage() {
  const [site, facilities] = await Promise.all([load<SiteSettings>('/site'), load<Facility[]>('/facilities')]);
  const s = site.data;
  const facs = facilities.data ?? [];

  return (
    <>
      <section className="a-hero shot" aria-labelledby="ab-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="kb" src="/art/scene-rower.svg" alt="Graphic of a rowing machine on the gym floor" width={800} height={600} style={{ position: 'absolute', inset: 0 }} />
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,19,18,.4) 0%, rgba(17,19,18,.96) 80%)' }} />
        <span className="pt">Photo placeholder</span>
        <div className="wrap between" style={{ position: 'relative', zIndex: 2, paddingTop: 200, paddingBottom: 80, alignItems: 'flex-end' }}>
          <div className="stack" style={{ gap: 26 }}>
            <p className="lbl rv">About the club</p>
            <h1 id="ab-h" className="display rv d1">Built around<br /><span className="lime">movement.</span></h1>
          </div>
          <p className="lead rv d2" style={{ color: '#C9CFC9', maxWidth: 420 }}>
            Apex Fitness Club is a fitness center on {s?.street ?? 'River Avenue'} in Napa, California — focused on helping people train, move and get stronger.
          </p>
        </div>
      </section>

      <section className="sec" aria-labelledby="ci-h">
        <div className="wrap grid-57" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 20 }}><Lbl or>01 — The club</Lbl><h2 id="ci-h" className="h1">A club for<br />every level.</h2></div>
          <div className="stack" style={{ gap: 24 }}>
            <p style={{ font: '400 clamp(1.4rem,2.4vw,2rem)/1.35 var(--fb)' }}>
              Whether you&apos;re new to training or experienced with a barbell, Apex is a place to show up, put in the work and keep moving forward — through strength, cardio, group and personal training.
            </p>
            {s?.story ? <p className="lead" style={{ whiteSpace: 'pre-line' }}>{s.story}</p> : (
              <div className="ph-box">
                <Ph>Client information to be supplied</Ph>
                <p className="phc">[Club background — who runs Apex and what the club is about, in Rachel Cooper&apos;s words.]</p>
                <p className="phc">[The community and atmosphere members can expect.]</p>
              </div>
            )}
            <Link className="arrow" href="/programs">See our programs <Arrow size={20} /></Link>
          </div>
        </div>
      </section>

      <section className="sec light" aria-labelledby="tp-h">
        <div className="wrap stack" style={{ gap: 40 }}>
          <div className="between">
            <Lbl>02 — Training philosophy</Lbl>
            <Ph>Proposed principles — not an official mission statement</Ph>
          </div>
          <h2 id="tp-h" className="sr-only">Training philosophy</h2>
          <div>
            <div className="phil sr"><span className="w">Show up.</span><p className="lead">Consistency beats intensity. Every session counts, whatever your starting point.</p></div>
            <div className="phil sr"><span className="w stroke">Train with intent.</span><p className="lead">Know why you&apos;re training and move with purpose — every rep, every interval.</p></div>
            <div className="phil sr"><span className="w">Keep <span style={{ background: 'var(--lime)', padding: '0 .08em' }}>moving.</span></span><p className="lead">Progress is a direction, not a finish line. Keep going forward.</p></div>
          </div>
          <div className="ph-box"><p className="phc">[Replace or confirm these principles with the club&apos;s own training philosophy.]</p></div>
        </div>
      </section>

      <section className="sec" aria-labelledby="fo-h">
        <div className="wrap stack" style={{ gap: 44 }}>
          <div className="between">
            <div className="stack" style={{ gap: 20 }}><Lbl>03 — The facility</Lbl><h2 id="fo-h" className="h1">Inside<br />the club.</h2></div>
            {facs.some((f) => f.isPlaceholder) && <Ph>Confirmed facilities &amp; real photos to be supplied</Ph>}
          </div>
          {facilities.error ? <ErrorState message="Facilities couldn’t be loaded right now." /> : facs.length === 0 ? (
            <p className="lead">Facility details are coming soon. <Link href="/contact">Ask the club</Link> or visit in person.</p>
          ) : (
            <div className="fac">
              {facs.map((f, i) => (
                <figure key={f.id} className="shot shade sr" style={{ margin: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="z" src={f.image} alt="" width={800} height={600} loading="lazy" />
                  <figcaption className="stack" style={{ position: 'absolute', zIndex: 2, left: 24, bottom: 20, right: 24, gap: 4 }}>
                    <span className={i % 5 === 0 ? 'h2' : 'h4'}>{f.name}</span>
                    {f.description && <Txt as="span" className="small" text={f.description} />}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="on-lime" aria-labelledby="cc-h" style={{ background: 'var(--lime)', color: 'var(--ink)', position: 'relative', overflow: 'hidden' }}>
        <div className="wrap between" style={{ paddingBlock: 'clamp(80px,10vw,140px)', alignItems: 'center' }}>
          <h2 id="cc-h" className="display" style={{ fontSize: 'clamp(3.2rem,9vw,8.6rem)' }}>Take the<br />first step.</h2>
          <div className="stack" style={{ gap: 14, alignItems: 'flex-start' }}>
            <Link className="btn btn-dark" href="/contact">Contact the Club <Arrow /></Link>
            {s && <a href={`tel:${s.phoneHref}`} style={{ font: '700 .875rem var(--fl)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink)', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Or call {s.phone}</a>}
          </div>
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, width: '22%', height: 10, background: 'var(--orange)' }} />
      </section>
    </>
  );
}
