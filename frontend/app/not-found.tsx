import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main" className="wrap stack" style={{ minHeight: '80vh', justifyContent: 'center', gap: 24 }}>
      <p className="lbl or">404</p>
      <h1 className="display">Off the<br /><span className="lime">track.</span></h1>
      <p className="lead">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="row stack-sm">
        <Link className="btn btn-lime" href="/">Back to Home</Link>
        <Link className="btn btn-line" href="/programs">Explore Programs</Link>
      </div>
    </main>
  );
}
