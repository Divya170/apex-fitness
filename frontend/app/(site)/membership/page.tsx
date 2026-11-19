import type { Metadata } from 'next';
import { Arrow, BenefitIcon } from '@/components/Icons';
import { ErrorState, Lbl, Ph, Shot, Txt } from '@/components/ui';
import { load } from '@/lib/api';
import type { Benefit, Plan, Program, SiteSettings } from '@/lib/types';
import MembershipExperience from './MembershipExperience';

export const metadata: Metadata = { title: 'Membership', description: 'Explore membership at Apex Fitness Club and send a membership inquiry.' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function MembershipPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const [plans, benefits, programs, site] = await Promise.all([
    load<Plan[]>('/plans'), load<Benefit[]>('/benefits'), load<Program[]>('/programs'), load<SiteSettings>('/site'),
  ]);
  const s = site.data;
  const bens = benefits.data ?? [];

  const middle = (
    <>
      <section className="sec light" aria-labelledby="bn-h">
        <div className="wrap grid-57" style={{ alignItems: 'start' }}>
          <div className="stack" style={{ gap: 20 }}>
            <Lbl>02 — What&apos;s included</Lbl>
            <h2 id="bn-h" className="h1">Membership<br />benefits.</h2>
            {bens.some((b) => b.isPlaceholder) && <Ph>Only confirmed benefits will be listed</Ph>}
          </div>
          {benefits.error ? <ErrorState message="Benefits couldn’t be loaded." /> : bens.length === 0 ? (
            <p className="lead">Ask the club what&apos;s included with each membership.</p>
          ) : (
            <div>
              {bens.map((b) => (
                <div key={b.id} className="ben"><BenefitIcon name={b.icon} /><b className="h3">{b.title}</b><Txt as="span" className="small" text={b.detail} /></div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="sec-s" aria-labelledby="hw-h">
        <div className="wrap stack" style={{ gap: 32 }}>
          <div className="between"><h2 id="hw-h" className="h2">How joining works</h2><Ph>Proposed process — confirm with the club</Ph></div>
          <ol className="steps" style={{ listStyle: 'none' }}>
            <li className="step"><span className="big-num" style={{ WebkitTextStrokeColor: 'var(--lime)' }}>01</span><h3 className="h3">Send an inquiry</h3><p className="muted small">Tell us what you&apos;re looking for using the form below.</p></li>
            <li className="step"><span className="big-num">02</span><h3 className="h3">Hear from the club</h3><p className="muted small">The team gets back to you with plan and pricing details.</p></li>
            <li className="step"><span className="big-num">03</span><h3 className="h3">Visit &amp; get started</h3><p className="muted small">Finalise your membership directly with Apex.</p></li>
          </ol>
        </div>
      </section>
    </>
  );

  return (
    <>
      <section className="m-hero" aria-labelledby="mh-h">
        <div className="wrap stack" style={{ gap: 28, paddingTop: 190, paddingBottom: 80, justifyContent: 'flex-end', maxWidth: 'none', paddingRight: 'clamp(20px,3vw,48px)' }}>
          <p className="lbl or rv">Membership</p>
          <h1 id="mh-h" className="display rv d1" style={{ fontSize: 'clamp(3.2rem,7.6vw,8rem)' }}>Make your<br />commitment<br /><span className="lime">count.</span></h1>
          <p className="lead rv d2">Find the membership that fits how you train. Send an inquiry and the Apex team will take you through plans, pricing and next steps — no commitment.</p>
          <div className="row stack-sm rv d3">
            <a className="btn btn-lime" href="#inquiry">Send a Membership Inquiry <Arrow /></a>
            <a className="btn btn-line" href="#plans">Compare Plans</a>
          </div>
        </div>
        <Shot src="/art/scene-kettlebell.svg" alt="Graphic of kettlebells on a gym floor" imgClass="kb" priority className="rv d2" style={{ minHeight: 480 }}>
          <div aria-hidden="true" style={{ position: 'absolute', zIndex: 2, left: 0, bottom: 0, width: '45%', height: 10, background: 'var(--lime)' }} />
        </Shot>
      </section>

      <MembershipExperience
        plans={plans.data ?? []}
        plansError={!!plans.error}
        programs={programs.data ?? []}
        initialPlanSlug={one(sp.plan)}
        initialProgramSlug={one(sp.program)}
        site={s}
        middle={middle}
      />
    </>
  );
}
