import { PieChart } from '@mui/x-charts/PieChart';
import { Loader2 } from 'lucide-react';
import { useTrendingTags } from '../../hooks/usePosts';
import { DOMAINS } from '../../data/mockPosts';

function Section({ title, children }) {
  return (
    <div className="bg-card border border-card-border rounded-xl px-4 py-3.5 transition-colors duration-250">
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-muted mb-2.5">
        {title}
      </p>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center p-3"><Loader2 size={16} color="var(--text-muted)" className="animate-spin" /></div>;
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
    <aside className="hidden lg:flex sticky top-[112px] h-[calc(100svh-112px)] overflow-y-auto w-60 shrink-0 flex-col gap-3.5 pb-6 scrollbar-none">
      <Section title="📊 Domain Activity">
        {isLoading ? <Spinner /> : !slices.length ? (
          <p className="text-[13px] text-text-muted">No data yet.</p>
        ) : (
          <div className="flex flex-col items-center gap-3.5">
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
            <div className="flex flex-col gap-1.5 w-full">
              {slices.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-text-secondary flex-1">{s.label}</span>
                  <span className="text-xs font-semibold text-text-primary">
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
