'use client';

import { useEffect, useState } from 'react';

/** Lime program ticker with a pause control (auto-moving content > 5s must be pausable). */
export default function Ticker({ words }: { words: string[] }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true); }, []);
  if (!words.length) return null;
  const loop = [...words, ...words, ...words, ...words];
  return (
    <>
      <div className="ticker" role="region" aria-label="Programs at Apex">
        <div className={`ticker-track ${paused ? 'paused' : ''}`} aria-hidden="true">
          {loop.map((w, k) => <span key={k}>{w}</span>)}
        </div>
        <p className="sr-only">Programs: {words.join(', ')}.</p>
      </div>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10 }}>
        <button type="button" className="arrow" style={{ fontSize: '.6875rem' }} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
          {paused ? 'Play ticker' : 'Pause ticker'}
        </button>
      </div>
    </>
  );
}
