import toast from 'react-hot-toast';

/**
 * Rich notification toast component.
 * Matches the app's Twitter-blue design system.
 *
 * @param {object} t        - The toast object passed by react-hot-toast
 * @param {string} title    - Primary notification line (bold)
 * @param {string} [body]   - Optional secondary line (muted)
 * @param {string} [type]   - 'message' | 'collab' | 'friend' | 'job' | 'info'
 */
export function NotificationToast({ t, title, body, type = 'info' }) {
  const icons = {
    message: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    collab: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    friend: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    job: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  };

  const accentColors = {
    message: 'var(--accent)',
    collab:  'var(--domain-aiml)',
    friend:  'var(--domain-webdev)',
    job:     'var(--domain-career)',
    info:    'var(--accent)',
  };

  const accentColor = accentColors[type] ?? 'var(--accent)';

  return (
    <div
      onClick={() => toast.dismiss(t.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px 16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: '14px',
        boxShadow: 'var(--shadow-popup)',
        cursor: 'pointer',
        maxWidth: '360px',
        width: '100%',
        opacity: t.visible ? 1 : 0,
        transform: t.visible ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
        transition: 'opacity 200ms ease, transform 200ms ease',
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          flexShrink: 0,
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accentColor} 25%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accentColor,
        }}
      >
        {icons[type] ?? icons.info}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
        <p
          style={{
            margin: 0,
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: '1.35',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </p>
        {body && (
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: '1.4',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {body}
          </p>
        )}
      </div>

      {/* Dismiss X */}
      <button
        onClick={(e) => { e.stopPropagation(); toast.dismiss(t.id); }}
        style={{
          flexShrink: 0,
          marginTop: '1px',
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          lineHeight: 1,
          borderRadius: '4px',
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Helper — infers the toast type from the notification text.
 * Falls back to 'info' if nothing matches.
 */
function inferType(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('messag')) return 'message';
  if (lower.includes('collab') || lower.includes('request')) return 'collab';
  if (lower.includes('friend') || lower.includes('follow') || lower.includes('connect')) return 'friend';
  if (lower.includes('job') || lower.includes('applied') || lower.includes('applicant')) return 'job';
  return 'info';
}

/**
 * Drop-in replacement for `toast(text, { icon: '🔔' })`.
 *
 * @param {string} text  - Full notification text (e.g. "sourav messaged you: yess")
 */
export function showNotificationToast(text) {
  // Split on the first colon so "title: body" renders nicely,
  // otherwise the whole string becomes the title.
  const colonIdx = text.indexOf(': ');
  const title = colonIdx !== -1 ? text.slice(0, colonIdx).trim() : text.trim();
  const body  = colonIdx !== -1 ? text.slice(colonIdx + 2).trim() : undefined;
  const type  = inferType(text);

  toast.custom((t) => (
    <NotificationToast t={t} title={title} body={body} type={type} />
  ), {
    duration: 4500,
    position: 'top-right',
  });
}
