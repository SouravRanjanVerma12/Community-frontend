// components/collab/CollaborationSidebar.js


export default function CollaborationSidebar({ activity }) {
  return (
    <>
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: 12, borderLeftColor: 'var(--coral)' }}>📢 Recent Activity</div>
        {activity.length === 0 && <div style={{ color: 'var(--txt3)' }}>No recent activity</div>}
        {activity.map(act => (
          <div key={act.id} style={{ fontSize: 13, color: 'var(--txt2)', borderLeft: '2px solid var(--coral)', paddingLeft: 10, marginBottom: 12 }}>
            {act.text}
            <div style={{ fontSize: 10, color: 'var(--txt3)', marginTop: 4 }}>{new Date(act.time).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '16px', background: 'var(--amethyst-bg)', borderColor: 'rgba(155,89,182,0.3)' }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 Need help?</div>
        <div style={{ fontSize: 12, color: 'var(--txt2)', marginBottom: 12 }}>Ask AI Mentor or request a code review from the community.</div>
        <button className="badge badge-teal" style={{ cursor: 'pointer' }}>Request Review →</button>
      </div>
    </>
  );
}