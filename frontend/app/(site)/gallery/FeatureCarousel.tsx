'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from '@/components/Icons';
import type { GalleryImage } from '@/lib/types';

/** Slow featured crossfade (6.5s): pauses on hover, when the user navigates, or for reduced motion. */
export default function FeatureCarousel({ images }: { images: GalleryImage[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const n = images.length;

  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true); }, []);
  useEffect(() => {
    if (paused || hover || n < 2) return;
    const t = setInterval(() => setI((k) => (k + 1) % n), 6500);
    return () => clearInterval(t);
  }, [paused, hover, n]);

  const go = (d: number) => { setI((k) => (k + d + n) % n); setPaused(true); };
  const cur = images[i];

  return (
    <div className="feature shot" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} role="region" aria-roledescription="carousel" aria-label="Featured images">
      {images.map((g, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={g.id} className={`xf ${k === i ? 'on' : ''}`} src={g.image} alt={k === i ? g.alt : ''} aria-hidden={k !== i} width={800} height={600} />
      ))}
      <div className="shade" style={{ position: 'absolute', inset: 0 }} />
      <div className="wrap between" style={{ position: 'absolute', zIndex: 3, left: 0, right: 0, bottom: 28, alignItems: 'center' }}>
        <p className="h3" aria-live="polite">{cur.title} · {cur.category}</p>
        {n > 1 && (
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="icon-btn" aria-label="Previous featured image" onClick={() => go(-1)}><ChevronLeft size={20} /></button>
            <button type="button" className="icon-btn" aria-label={paused ? 'Play featured images' : 'Pause featured images'} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? <Play /> : <Pause />}</button>
            <button type="button" className="icon-btn" aria-label="Next featured image" onClick={() => go(1)}><ChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
