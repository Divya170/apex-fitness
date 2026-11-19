'use client';

import { useEffect, useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { Pause, Play } from './Icons';

/** Slow hero crossfade (6.5s) fed by the gallery's featured images. Pauses on hover/focus, user-pausable, off for reduced motion. */
export default function HeroRotator({ images }: { images: GalleryImage[] }) {
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

  const cur = images[i];
  return (
    <>
      <div className="hero-img shot" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="kb" style={{ position: 'absolute', inset: 0 }}>
          {images.map((img, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={img.id} className={`xf ${k === i ? 'on' : ''}`} src={img.image} alt={k === i ? img.alt : ''} aria-hidden={k !== i} width={800} height={600} fetchPriority={k === 0 ? 'high' : 'low'} />
          ))}
        </div>
        <div className="shade-l" style={{ position: 'absolute', inset: 0 }} />
        {cur?.isPlaceholder && <span className="pt">Photo placeholder · {cur.category}</span>}
      </div>
      {n > 1 && (
        <div className="hero-meta rv d4">
          <div className="row" style={{ gap: 6 }} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
            {images.map((img, k) => (
              <button key={img.id} type="button" className="bar-btn" aria-label={`Show image ${k + 1}: ${img.category}`} aria-pressed={k === i} onClick={() => { setI(k); setPaused(true); }}><span /></button>
            ))}
            <button type="button" className="icon-btn" style={{ width: 44, height: 44 }} aria-label={paused ? 'Play image rotation' : 'Pause image rotation'} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
              {paused ? <Play /> : <Pause />}
            </button>
          </div>
          <span className="mono xs" style={{ letterSpacing: '.2em', color: 'var(--orange)' }}>{String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
          <a className="scroll-cue hide-md" href="#intro">Scroll<i /></a>
        </div>
      )}
    </>
  );
}
