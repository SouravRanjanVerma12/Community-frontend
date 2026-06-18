// components/collab/CollaborationSidebar.js


export default function CollaborationSidebar({ activity }) {
  return (
    <>
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: 12, borderLeft: '3px solid var(--domain-career)', paddingLeft: 12 }}>📢 Recent Activity</div>
        {activity.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No recent activity</div>}
        {activity.map(act => (
          <div key={act.id} style={{ fontSize: 13, color: 'var(--text-secondary)', borderLeft: '2px solid var(--domain-career)', paddingLeft: 10, marginBottom: 12 }}>
            {act.text}
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(act.time).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '16px', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>💡 Need help?</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Ask AI Mentor or request a code review from the community.</div>
        <button className="badge badge-teal" style={{ cursor: 'pointer' }}>Request Review →</button>
      </div>
    </>
  );
}