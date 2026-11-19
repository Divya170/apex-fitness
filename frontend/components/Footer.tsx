import Link from 'next/link';
import type { SiteSettings } from '@/lib/types';
import { Logo } from './Icons';

export default function Footer({ site }: { site: SiteSettings | null }) {
  return (
    <footer className="ftr" style={{ overflow: 'hidden' }}>
      <div className="wrap" style={{ paddingTop: 'clamp(64px,8vw,104px)' }}>
        <div className="between" style={{ paddingBottom: 56, borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
          <p className="h2" style={{ maxWidth: 760 }}>Ready when <span className="lime">you are.</span></p>
          <div className="row stack-sm">
            <Link className="btn btn-lime" href="/membership#inquiry">Join Now</Link>
            {site && <a className="btn btn-line" href={`tel:${site.phoneHref}`}>Call the Club</a>}
          </div>
        </div>
        <div className="ftr-grid" style={{ paddingBlock: 56 }}>
          <div className="stack" style={{ gap: 18 }}>
            <Link className="logo" href="/" aria-label="Apex Fitness Club — home"><Logo /><span><b>Apex</b><small>Fitness Club · Napa</small></span></Link>
            <p className="small muted" style={{ maxWidth: '36ch' }}>A fitness club in Napa, California, for strength, cardio, group and personal training.</p>
          </div>
          <nav aria-label="Footer">
            <h2>Explore</h2>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 24 }}>
              <li><Link href="/">Home</Link></li><li><Link href="/about">About</Link></li>
              <li><Link href="/programs">Programs</Link></li><li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/membership">Membership</Link></li><li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
          <div>
            <h2>Visit &amp; contact</h2>
            {site ? (
              <address className="stack" style={{ fontStyle: 'normal', gap: 2 }}>
                <a href={site.directionsUrl} target="_blank" rel="noopener noreferrer" style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center' }}>{site.street}, {site.city}, {site.country}</a>
                <a href={`tel:${site.phoneHref}`} style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', fontWeight: 600 }}>{site.phone}</a>
                <a href={`mailto:${site.email}`} style={{ minHeight: 40, display: 'inline-flex', alignItems: 'center', overflowWrap: 'anywhere' }}>{site.email}</a>
              </address>
            ) : <p className="small muted">Contact details are temporarily unavailable.</p>}
          </div>
        </div>
      </div>
      <div className="wrap between xs muted" style={{ paddingBlock: '22px 30px', borderTop: '1px solid var(--line)', alignItems: 'center' }}>
        <p>© {new Date().getFullYear()} Apex Fitness Club. All rights reserved.</p>
        {site?.privacyUrl ? <a href={site.privacyUrl}>Privacy policy</a> : <p>Social links appear once official accounts are provided.</p>}
      </div>
    </footer>
  );
}
