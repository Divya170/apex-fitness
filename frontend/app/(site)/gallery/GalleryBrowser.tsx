'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Close, Expand } from '@/components/Icons';
import { ErrorState } from '@/components/ui';
import { api, ApiError, qs } from '@/lib/api';
import type { Facet, GalleryImage } from '@/lib/types';

export default function GalleryBrowser({ initialImages, categories }: { initialImages: GalleryImage[]; categories: Facet[] }) {
  const [cat, setCat] = useState('');
  const [images, setImages] = useState(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [open, setOpen] = useState(-1);
  const first = useRef(true);

  // Category filtering happens on the API.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const ctrl = new AbortController();
    setLoading(true);
    setError('');
    api<GalleryImage[]>(`/gallery${qs({ category: cat })}`, { signal: ctrl.signal })
      .then((d) => { setImages(d); setOpen(-1); })
      .catch((e) => { if (e.name !== 'AbortError') setError(e instanceof ApiError ? e.message : 'Could not load images.'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [cat, reload]);

  const total = categories.reduce((n, c) => n + c.count, 0);
  const withImages = categories.filter((c) => c.count > 0);

  return (
    <>
      <div className="between" style={{ alignItems: 'center' }}>
        <h2 id="gg-h" className="h2">Browse</h2>
        <p className="small muted" role="status" aria-live="polite">{loading ? 'Loading…' : `${images.length} image${images.length === 1 ? '' : 's'}${cat ? ` in ${cat}` : ''}`}</p>
      </div>
      {withImages.length > 1 && (
        <div className="chips scroll" role="group" aria-label="Filter by category">
          <button type="button" className="chip" aria-pressed={!cat} onClick={() => setCat('')}>All <span className="ct">{total}</span></button>
          {withImages.map((c) => <button key={c.value} type="button" className="chip" aria-pressed={cat === c.value} onClick={() => setCat(c.value)}>{c.value} <span className="ct">{c.count}</span></button>)}
        </div>
      )}
      {error ? (
        <ErrorState message={error} action={<button type="button" className="arrow" onClick={() => setReload((n) => n + 1)}>Try again</button>} />
      ) : images.length === 0 && !loading ? (
        <div className="state"><h3 className="h3">No photos here yet</h3><p className="muted">New photos of the club are on the way.</p>{cat && <button type="button" className="btn btn-lime btn-sm" onClick={() => setCat('')}>Show all photos</button>}</div>
      ) : (
        <div className={`masonry ${loading ? 'busy' : ''}`} aria-busy={loading}>
          {images.map((g, k) => (
            <button key={g.id} type="button" className="tile" onClick={() => setOpen(k)} aria-label={`Open image: ${g.title}`} aria-haspopup="dialog">
              <span className="shot shade" style={{ display: 'block', aspectRatio: g.ratio }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="z" src={g.image} alt="" width={800} height={600} loading="lazy" />
                {g.isPlaceholder && <span className="pt">Placeholder</span>}
                <span className="meta">
                  <span className="stack" style={{ gap: 4 }}>
                    <span className="mono xs lime" style={{ letterSpacing: '.16em', textTransform: 'uppercase' }}>{g.category}</span>
                    <span className="h3" style={{ fontSize: '1.4rem' }}>{g.title}</span>
                  </span>
                  <Expand />
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      {open >= 0 && images[open] && <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(-1)} />}
    </>
  );
}

/** Accessible lightbox: focus trap, Escape to close, ←/→ and swipe to browse, focus restored on close. */
function Lightbox({ images, index, onIndex, onClose }: { images: GalleryImage[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const n = images.length;
  const cur = images[index];
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef(0);
  const state = useRef({ index, n, onIndex, onClose });
  state.current = { index, n, onIndex, onClose };

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      const s = state.current;
      if (e.key === 'Escape') s.onClose();
      else if (e.key === 'ArrowLeft') s.onIndex((s.index - 1 + s.n) % s.n);
      else if (e.key === 'ArrowRight') s.onIndex((s.index + 1) % s.n);
      else if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('button');
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus?.(); };
  }, []);

  return (
    <div className="lb" role="dialog" aria-modal="true" aria-labelledby="lb-title" ref={panel}>
      <div className="lb-top">
        <div className="stack" style={{ gap: 4 }}>
          <span className="mono xs lime" style={{ letterSpacing: '.16em', textTransform: 'uppercase' }}>{cur.category} · {index + 1} / {n}</span>
          <h2 id="lb-title" className="h3">{cur.title}</h2>
        </div>
        <button ref={closeBtn} type="button" className="icon-btn" aria-label="Close gallery (Escape)" onClick={onClose}><Close /></button>
      </div>
      <div className="lb-stage">
        <button type="button" className="icon-btn" aria-label="Previous image" onClick={() => onIndex((index - 1 + n) % n)} disabled={n < 2}><ChevronLeft /></button>
        <div
          className="lb-img shot"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 40) onIndex((index + (dx < 0 ? 1 : -1) + n) % n); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.image} alt={cur.alt} width={800} height={600} style={{ objectFit: 'contain' }} />
        </div>
        <button type="button" className="icon-btn" aria-label="Next image" onClick={() => onIndex((index + 1) % n)} disabled={n < 2}><ChevronRight /></button>
      </div>
      <p className="xs muted" style={{ textAlign: 'center', paddingBottom: 18 }}>
        Swipe or use ← → to browse, Esc to close.{cur.isPlaceholder ? ' Placeholder graphic — real photo to be supplied.' : ''}
      </p>
    </div>
  );
}
