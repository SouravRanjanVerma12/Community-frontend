import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, ClipboardList, CheckCircle, Wallet, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import ApplyJobModal from './ApplyJobModal';

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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, type: 'spring', stiffness: 100, damping: 20 }}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        className="group relative bg-card/90 backdrop-blur-sm rounded-[24px] p-5 flex flex-col gap-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-border/40 cursor-pointer overflow-hidden"
        onClick={() => {
          if (!isOwn && !hasApplied && !closed) setApplyOpen(true);
        }}
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10 group-hover:bg-accent/10 transition-colors" />

        {/* Top: work mode + employment type + time */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
              {WORK_MODE_LABELS[job.workMode] ?? job.workMode}
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-2 text-text-secondary border border-border/50">
              {EMPLOYMENT_LABELS[job.employmentType] ?? job.employmentType}
            </span>
            {closed && (
              <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">Closed</span>
            )}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
            <Clock size={11} /> {timeAgo(job.createdAt)}
          </span>
        </div>

        {/* Title + company */}
        <div className="mt-1">
          <h3 className="text-[16px] font-bold text-text-primary leading-snug tracking-tight group-hover:text-accent transition-colors">
            {job.title}
          </h3>
          <p className="text-[13px] font-semibold mt-0.5 text-accent">
            {job.company}
          </p>
          {job.location && (
            <p className="text-xs text-text-muted mt-1.5 flex items-center gap-1">
              <MapPin size={11} /> {job.location}
            </p>
          )}
          {job.description && (
            <p className="text-[13px] text-text-secondary leading-relaxed mt-2.5 line-clamp-2">
              {job.description}
            </p>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {job.skills.map((s) => (
              <span key={s} className="px-2.5 py-[3px] rounded-md bg-surface-1 text-text-secondary text-[11px] font-medium font-mono border border-border/40">{s}</span>
            ))}
          </div>
        )}

        {/* Salary */}
        {job.salaryRange && (
          <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5 mt-1">
            <Wallet size={12} className="text-accent" /> {job.salaryRange}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-border/40 flex-wrap">
          {/* Poster */}
          <Link to={`/profile/${job.postedBy?._id}`} className="flex items-center gap-1.5 no-underline shrink-0 group/avatar z-10 min-w-0 max-w-[45%]" onClick={(e) => e.stopPropagation()}>
            <Avatar name={job.postedBy?.name} src={job.postedBy?.avatarUrl} size={24} />
            <span className="text-[12px] text-text-muted font-medium group-hover/avatar:text-text-primary transition-colors truncate">{job.postedBy?.name}</span>
          </Link>

          {/* Action & Badges Right Side */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto z-10 flex-wrap" onClick={(e) => e.stopPropagation()}>
            {/* Applicant count */}
            {(job.applicantCount ?? 0) > 0 && (
              <span className="shrink-0 text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">🔥 {job.applicantCount} applied</span>
            )}

            {/* Action Area */}
            {isOwn ? (
              showReviewLink && (job.applicantCount ?? 0) > 0 ? (
                <Link to={`/jobs/${job._id}/applicants`} className="no-underline block">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-accent text-white shadow-sm shadow-accent/20"
                  >
                    <ClipboardList size={13} /> Review
                  </motion.div>
                </Link>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg text-accent bg-accent/10 border border-accent/20">Your posting</span>
              )
            ) : hasApplied ? (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-lg">
                <CheckCircle size={12} /> Applied
              </span>
            ) : closed ? (
              <span className="text-[11px] font-medium text-text-muted bg-surface-2 px-2.5 py-1 rounded-lg">Closed</span>
            ) : (
              <motion.button 
                onClick={() => setApplyOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-xl bg-text-primary text-card hover:bg-accent hover:text-white transition-colors shadow-sm"
              >
                Apply <ArrowRight size={13} />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {applyOpen && (
        <ApplyJobModal job={job} onClose={(success) => { setApplyOpen(false); if (success) { setJustApplied(true); onApplied?.(); } }} />
      )}
    </>
  );
}
