// components/collab/CollaborationSidebar.js
import { Megaphone, Lightbulb, ArrowRight, Inbox } from 'lucide-react';

export default function CollaborationSidebar({ activity }) {
  return (
    <>
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-card p-4">
        <div className="text-base font-bold text-text-primary mb-3 flex items-center gap-2 uppercase tracking-wider border-l-[3px] border-domain-career pl-3">
          <Megaphone size={14} color="var(--domain-career)" />
          Recent Activity
        </div>
        {activity.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-text-muted px-2 py-5 text-center">
            <Inbox size={28} color="var(--text-faint)" />
            <span className="text-[13px] leading-[1.6]">No recent activity yet</span>
          </div>
        )}
        {activity.map(act => (
          <div key={act.id} className="text-sm leading-[1.6] text-text-secondary border-l-2 border-domain-career pl-2.5 mb-3">
            {act.text}
            <div className="text-xs text-text-muted mt-1">{new Date(act.time).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <div className="bg-accent-bg border border-accent-border rounded-2xl overflow-hidden shadow-card p-4">
        <div className="font-semibold mb-2 text-text-primary flex items-center gap-2 text-[15px]">
          <Lightbulb size={16} color="var(--accent)" />
          Need help?
        </div>
        <div className="text-[13px] leading-[1.6] text-text-secondary mb-3">Ask AI Mentor or request a code review from the community.</div>
        <button
          className={[
            'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold',
            'border border-domain-backend text-domain-backend bg-[rgba(5,150,105,0.08)]',
            'cursor-pointer gap-1.5 min-h-11 px-4 text-[13px] border-none',
            'transition-transform duration-200 hover:-translate-y-px hover:shadow-sm',
            'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          ].join(' ')}
        >
          Request Review <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}
