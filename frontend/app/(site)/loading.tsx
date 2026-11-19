export default function Loading() {
  return (
    <div className="wrap stack" style={{ gap: 24, paddingTop: 180, paddingBottom: 80 }} aria-busy="true" aria-label="Loading page">
      <div className="skeleton" style={{ height: 18, width: 200 }} />
      <div className="skeleton" style={{ height: 'clamp(80px,10vw,150px)', width: '80%' }} />
      <div className="skeleton" style={{ height: 22, width: '50%' }} />
      <div className="cols-3" style={{ gap: 14, marginTop: 24 }}>{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 300 }} />)}</div>
    </div>
  );
}
