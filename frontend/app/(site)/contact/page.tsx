import type { Metadata } from 'next';
import { Arrow } from '@/components/Icons';
import { ErrorState, Lbl, Ph } from '@/components/ui';
import { load } from '@/lib/api';
import type { HoursRow, SiteSettings } from '@/lib/types';
import ContactForm from './ContactForm';

export const metadata: Metadata = { title: 'Contact', description: 'Call, email or visit Apex Fitness Club at 3627 River Avenue, Napa, CA.' };

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const topic = (Array.isArray(sp.topic) ? sp.topic[0] : sp.topic) ?? '';
  const [site, hours] = await Promise.all([load<SiteSettings>('/site'), load<{ confirmed: boolean; rows: HoursRow[] }>('/hours')]);
  const s = site.data;
  // Map embed uses the address search, so no coordinates are invented.
  const embed = s ? `https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery || `${s.street}, ${s.city}`)}&z=15&output=embed` : '';

  return (
    <>
      <section aria-labelledby="ct-h" style={{ paddingTop: 170, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" className="wordmark" style={{ position: 'absolute', right: '-2%', top: 110, WebkitTextStrokeColor: '#1F2522', fontSize: 'clamp(8rem,26vw,24rem)' }}>Move</div>
        <div className="wrap stack" style={{ position: 'relative', gap: 28, paddingBottom: 56 }}>
          <p className="lbl rv">Contact</p>
          <h1 id="ct-h" className="display rv d1">Let&apos;s get<br />you <span className="lime">moving.</span></h1>
          <p className="lead rv d2">Questions about membership, programs or visiting the club? Call, email or send a message — the Apex team will get back to you.</p>
        </div>
        <div className="wrap">
          {s ? (
            <div className="cinfo rv d3">
              <a className="cbox" href={`tel:${s.phoneHref}`}>
                <span className="mono xs muted" style={{ letterSpacing: '.2em', textTransform: 'uppercase' }}>01 · Phone</span>
                <span className="h2" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)' }}>{s.phone}</span>
                <span className="go">Call the club <Arrow /></span>
              </a>
              <a className="cbox" href={`mailto:${s.email}`}>
                <span className="mono xs muted" style={{ letterSpacing: '.2em', textTransform: 'uppercase' }}>02 · Email</span>
                <span style={{ font: '700 clamp(1.1rem,1.8vw,1.5rem) var(--fl)', overflowWrap: 'anywhere' }}>{s.email}</span>
                <span className="go">Send an email <Arrow /></span>
              </a>
              <a className="cbox" href={s.directionsUrl} target="_blank" rel="noopener noreferrer">
                <span className="mono xs muted" style={{ letterSpacing: '.2em', textTransform: 'uppercase' }}>03 · Address</span>
                <span className="h3">{s.street}<br />{s.city}, {s.country}</span>
                <span className="go">Get directions <Arrow /></span>
              </a>
            </div>
          ) : <ErrorState message="Contact details couldn’t be loaded right now. Please refresh the page." />}
        </div>
      </section>

      {s && (
        <section id="map" className="sec-s" aria-labelledby="mp-h" style={{ scrollMarginTop: 84 }}>
          <div className="wrap stack" style={{ gap: 24 }}>
            <h2 id="mp-h" className="h2">Find the club</h2>
            <div className="mapgrid">
              <div className="mapframe">
                <iframe title={`Map showing ${s.street}, ${s.city}`} src={embed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              </div>
              <div className="stack" style={{ gap: 18, padding: 'clamp(24px,3vw,40px)', background: 'var(--bg2)', justifyContent: 'center' }}>
                <span className="mono xs lime" style={{ letterSpacing: '.2em', textTransform: 'uppercase' }}>Location</span>
                <p className="h3">{s.name}</p>
                <address className="muted" style={{ fontStyle: 'normal' }}>{s.street}<br />{s.city}<br />{s.country}</address>
                <a className="btn btn-lime" href={s.directionsUrl} target="_blank" rel="noopener noreferrer">Get Directions</a>
                <a className="arrow" href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Open in Google Maps <Arrow size={20} /></a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sec light" aria-labelledby="hr-h">
        <div className="wrap grid-57" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 20 }}>
            <Lbl>Business hours</Lbl>
            <h2 id="hr-h" className="h1">When we&apos;re<br />open.</h2>
            {!hours.data?.confirmed && <p className="lead">Contact us for current hours — we&apos;ll confirm opening times before you visit.</p>}
            {s && <div className="row stack-sm"><a className="btn btn-dark" href={`tel:${s.phoneHref}`}>Call for Hours</a></div>}
          </div>
          <div className="stack" style={{ gap: 16 }}>
            {hours.error ? <ErrorState message="Hours couldn’t be loaded — please call the club." /> : (
              <>
                {hours.data!.rows.some((r) => !r.value) && <Ph>Hours to be supplied by the club</Ph>}
                <dl className="hours">
                  {hours.data!.rows.map((r) => (
                    <div key={r.id} style={{ display: 'contents' }}>
                      <dt className="h4">{r.label}</dt>
                      <dd className={r.value ? '' : 'phc'} style={{ fontWeight: r.value ? 600 : 400 }}>{r.value ?? 'Contact us for current hours'}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="form" className="sec" aria-labelledby="cf-h" style={{ scrollMarginTop: 84 }}>
        <div className="wrap fwrap">
          <div className="stack sticky" style={{ gap: 22 }}>
            <Lbl or>Send a message</Lbl>
            <h2 id="cf-h" className="h1">Ask us<br />anything.</h2>
            <p className="lead">For membership specifically, the <a href="/membership#inquiry">membership inquiry</a> collects plan and program preferences.</p>
          </div>
          <div style={{ background: 'var(--bg2)', padding: 'clamp(24px,4vw,48px)', border: '1.5px solid var(--line)' }}>
            <ContactForm initialTopic={topic} privacyUrl={s?.privacyUrl ?? ''} />
          </div>
        </div>
      </section>
    </>
  );
}
