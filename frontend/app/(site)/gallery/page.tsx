import type { Metadata } from 'next';
import Link from 'next/link';
import { ErrorState, Ph } from '@/components/ui';
import { load } from '@/lib/api';
import type { Facet, GalleryImage } from '@/lib/types';
import FeatureCarousel from './FeatureCarousel';
import GalleryBrowser from './GalleryBrowser';

export const metadata: Metadata = { title: 'Gallery', description: 'Equipment, training areas and the atmosphere at Apex Fitness Club in Napa.' };

export default async function GalleryPage() {
  const [images, categories, featured] = await Promise.all([
    load<GalleryImage[]>('/gallery'), load<Facet[]>('/gallery/categories'), load<GalleryImage[]>('/gallery/featured'),
  ]);
  const all = images.data ?? [];

  return (
    <>
      <section aria-labelledby="gl-h" style={{ paddingTop: 160 }}>
        <div className="wrap stack" style={{ gap: 28, paddingBottom: 48 }}>
          <div className="between" style={{ alignItems: 'flex-end' }}>
            <div className="stack" style={{ gap: 24 }}><p className="lbl rv">Gallery</p><h1 id="gl-h" className="display rv d1">See the<br /><span className="lime">club.</span></h1></div>
            <div className="stack rv d2" style={{ gap: 12, maxWidth: 420 }}>
              <p className="lead">Equipment, training areas and the atmosphere at Apex.</p>
              {all.some((g) => g.isPlaceholder) && <Ph>Graphics stand in for genuine club photography</Ph>}
            </div>
          </div>
        </div>
        {(featured.data?.length ?? 0) > 0 && <FeatureCarousel images={featured.data!} />}
      </section>

      <section className="sec" aria-labelledby="gg-h">
        <div className="wrap stack" style={{ gap: 32 }}>
          {images.error || categories.error
            ? <ErrorState message="The gallery couldn’t be loaded right now. Please refresh the page." />
            : <GalleryBrowser initialImages={all} categories={categories.data!} />}
          <div className="between rule" style={{ paddingTop: 32, alignItems: 'center' }}>
            <p className="lead">Want to see it in person?</p>
            <div className="row stack-sm">
              <Link className="btn btn-lime" href="/contact?topic=Visiting%20the%20club#form">Plan a Visit</Link>
              <Link className="btn btn-line" href="/membership">Explore Membership</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
