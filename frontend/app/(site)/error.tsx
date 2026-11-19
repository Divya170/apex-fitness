'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="wrap stack" style={{ minHeight: '70vh', justifyContent: 'center', gap: 22, paddingTop: 120 }}>
      <p className="lbl or">Something went wrong</p>
      <h1 className="h1">We couldn&apos;t load this page.</h1>
      <p className="lead">Please try again. If it keeps happening, call or email the club directly.</p>
      <div className="row stack-sm">
        <button type="button" className="btn btn-lime" onClick={reset}>Try Again</button>
        <Link className="btn btn-line" href="/">Back to Home</Link>
      </div>
    </div>
  );
}
