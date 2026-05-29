import Navbar from '../components/layout/Navbar';

export default function CollabPage() {
  return (
    <div style={{ minHeight: '100svh', background: '#f8f9fb' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100svh - 60px)', color: '#9ca3af', fontSize: '15px' }}>
        Collab — coming soon
      </div>
    </div>
  );
}
