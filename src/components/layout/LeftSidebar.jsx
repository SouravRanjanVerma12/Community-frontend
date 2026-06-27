import { PieChart } from '@mui/x-charts/PieChart';
import { Loader2 } from 'lucide-react';
import { useTrendingTags } from '../../hooks/usePosts';
import { DOMAINS } from '../../data/mockPosts';

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px 16px', transition: 'background 0.25s, border-color 0.25s' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '10px' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}><Loader2 size={16} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
}

export default function LeftSidebar() {
  const { data: tags, isLoading } = useTrendingTags();

  const slices = (tags ?? []).map((tag, i) => {
    const domainValue = tag.label.replace('#', '');
    const domain = DOMAINS.find((d) => d.value === domainValue);
    return {
      id: domainValue,
      label: domain?.label ?? domainValue,
      value: tag.count,
      color: domain?.color ?? '#6b7280',
    };
  });
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  return (
    <aside style={{
      position: 'sticky', top: '112px',
      height: 'calc(100svh - 112px)', overflowY: 'auto',
      width: '240px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '14px',
      paddingBottom: '24px', scrollbarWidth: 'none',
    }}>
      <Section title="📊 Domain Activity">
        {isLoading ? <Spinner /> : !slices.length ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <PieChart
              series={[{
                data: slices,
                innerRadius: 32,
                outerRadius: 60,
                paddingAngle: 2,
                cornerRadius: 3,
              }]}
              width={160}
              height={160}
              slotProps={{ legend: { hidden: true } }}
              tooltip={{ trigger: 'item' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {slices.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {total > 0 ? Math.round((s.value / total) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>
    </aside>
  );
}
