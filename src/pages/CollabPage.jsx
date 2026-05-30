import Navbar from '../components/layout/Navbar';

export default function CollabPage() {
  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100svh - 60px)', color: 'var(--text-muted)', fontSize: '15px' }}>
        Collab — coming soon
      </div>
    </div>
  );
}
