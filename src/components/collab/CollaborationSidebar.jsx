// components/collab/CollaborationSidebar.js
import { Megaphone, Lightbulb, ArrowRight, Inbox } from 'lucide-react';

export default function CollaborationSidebar({ activity }) {
  return (
    <>
      <div className="card" style={{ padding: '16px' }}>
        <div className="section-title" style={{ marginBottom: 12, borderLeft: '3px solid var(--domain-career)', paddingLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Megaphone size={14} color="var(--domain-career)" />
          Recent Activity
        </div>
        {activity.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            color: 'var(--text-muted)', padding: '20px 8px', textAlign: 'center',
          }}>
            <Inbox size={28} color="var(--text-faint)" />
            <span style={{ fontSize: 13, lineHeight: 1.6 }}>No recent activity yet</span>
          </div>
        )}
        {activity.map(act => (
          <div key={act.id} style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', borderLeft: '2px solid var(--domain-career)', paddingLeft: 10, marginBottom: 12 }}>
            {act.text}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(act.time).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: '16px', background: 'var(--accent-bg)', borderColor: 'var(--accent-border)' }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
          <Lightbulb size={16} color="var(--accent)" />
          Need help?
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 12 }}>Ask AI Mentor or request a code review from the community.</div>
        <button
          className="badge badge-teal collab-sidebar-cta"
          style={{
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            minHeight: 44, padding: '0 16px', fontSize: 13, border: 'none',
          }}
        >
          Request Review <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}