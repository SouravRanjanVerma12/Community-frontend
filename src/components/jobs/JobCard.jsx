import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ClipboardList, CheckCircle, Wallet } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import ApplyJobModal from './ApplyJobModal';
import Button from '../ui/Button';

const JC = '#1e9df1';

const WORK_MODE_LABELS = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };
const EMPLOYMENT_LABELS = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', internship: 'Internship' };

function Avatar({ name, src, size = 24 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover border-2 border-card" />;
  return <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold border-2 border-card">{initials}</div>;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function JobCard({ job, index = 0, showReviewLink = false, applied = false, onApplied }) {
  const { user } = useAuthStore();
  const [applyOpen, setApplyOpen] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const isOwn   = user?._id === job.postedBy?._id;
  const closed  = job.status === 'closed';
  const hasApplied = applied || justApplied;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -3, boxShadow: `0 8px 32px ${JC}18, 0 2px 8px rgba(0,0,0,0.08)` }}
        className="bg-card rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm transition-[box-shadow,transform] duration-200 cursor-default"
        style={{ border: `1px solid ${JC}28` }}
      >
        {/* Top: work mode + employment type + time */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold" style={{ background: `${JC}14`, color: JC }}>
              {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
            </span>
            <span className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-surface-2 text-text-secondary">
              {EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType}
            </span>
            {closed && (
              <span className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-[rgba(239,68,68,0.1)] text-[#dc2626]">Closed</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <Clock size={11} /> {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Title + company */}
        <div>
          <h3 className="text-[15px] font-bold text-text-primary leading-[1.4] tracking-[-0.2px]">
            {job.title}
          </h3>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: JC }}>
            {job.company}
          </p>
          {job.location && (
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <MapPin size={11} /> {job.location}
            </p>
          )}
          {job.description && (
            <p className="text-[13px] text-text-secondary leading-[1.6] mt-1.5 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-[5px]">
            {job.skills.map((s) => (
              <span key={s} className="px-2.5 py-[3px] rounded-md bg-surface-2 text-text-secondary text-[11px] font-medium font-mono">{s}</span>
            ))}
          </div>
        )}

        {/* Salary */}
        {job.salaryRange && (
          <p className="text-xs font-semibold text-text-secondary flex items-center gap-1">
            <Wallet size={12} /> {job.salaryRange}
          </p>
        )}

        {/* Divider */}
        <div className="h-px bg-divider" />

        {/* Footer: author + stats + action */}
        <div className="flex items-center gap-2.5">
          {/* Poster */}
          <Link to={`/profile/${job.postedBy?._id}`} className="flex items-center gap-1.5 no-underline shrink-0">
            <Avatar name={job.postedBy?.name} src={job.postedBy?.avatarUrl} size={24} />
            <span className="text-xs text-text-muted font-medium">{job.postedBy?.name}</span>
          </Link>

          <div className="flex-1" />

          {/* Applicant count */}
          {(job.applicantCount ?? 0) > 0 && (
            <span className="text-[11px] font-semibold text-[#d97706]">🔥 {job.applicantCount} applied</span>
          )}

          {/* Action button */}
          {isOwn ? (
            showReviewLink && (job.applicantCount ?? 0) > 0 ? (
              <Link to={`/jobs/${job._id}/applicants`} className="no-underline">
                <Button size="sm" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }}>
                  <ClipboardList size={12} /> Review ({job.applicantCount})
                </Button>
              </Link>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ color: JC, background: `${JC}10`, border: `1px solid ${JC}25` }}>Your posting</span>
            )
          ) : hasApplied ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
              <CheckCircle size={13} /> Applied
            </span>
          ) : closed ? (
            <span className="text-[11px] font-medium text-text-muted">Closed</span>
          ) : (
            <Button size="sm" onClick={() => setApplyOpen(true)} style={{ padding: '6px 14px', fontSize: '12px', minHeight: 'auto' }}>
              <Briefcase size={12} /> Apply
            </Button>
          )}
        </div>
      </motion.div>

      {applyOpen && (
        <ApplyJobModal job={job} onClose={() => { setApplyOpen(false); setJustApplied(true); onApplied?.(); }} />
      )}
    </>
  );
}
