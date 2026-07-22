// Curated option lists for the "About"/profile section — distinct from
// `DOMAINS` in `mockPosts.js`, which categorizes POST content, not people.
// Keep these two taxonomies visually and semantically separate in the UI.

export const DEV_DOMAINS = [
  { value: 'frontend',         label: 'Frontend',              color: '#2563eb' },
  { value: 'backend',          label: 'Backend',                color: '#059669' },
  { value: 'fullstack',        label: 'Full-Stack',             color: '#4f46e5' },
  { value: 'mobile',           label: 'Mobile',                  color: '#db2777' },
  { value: 'devops',           label: 'DevOps',                  color: '#d97706' },
  { value: 'cloud',            label: 'Cloud',                    color: '#0284c7' },
  { value: 'data-science',     label: 'Data Science',            color: '#7c3aed' },
  { value: 'data-engineering', label: 'Data Engineering',         color: '#9333ea' },
  { value: 'ml-ai',            label: 'ML / AI',                  color: '#a21caf' },
  { value: 'qa',               label: 'QA / Testing',             color: '#0891b2' },
  { value: 'security',         label: 'Security',                  color: '#dc2626' },
  { value: 'design',           label: 'Design / UX',              color: '#ea580c' },
  { value: 'blockchain',       label: 'Blockchain / Web3',         color: '#65a30d' },
  { value: 'game-dev',         label: 'Game Dev',                  color: '#c026d3' },
  { value: 'embedded',         label: 'Embedded / IoT',             color: '#78716c' },
  { value: 'db-admin',         label: 'Database Admin',             color: '#0d9488' },
  { value: 'networking',       label: 'Networking',                  color: '#475569' },
  { value: 'it-support',       label: 'IT Support',                  color: '#64748b' },
  { value: 'tech-writing',     label: 'Technical Writing',          color: '#b45309' },
  { value: 'eng-management',   label: 'Engineering Management',     color: '#334155' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'student', label: 'Student' },
  { value: 'junior',  label: 'Junior (0-2 yrs)' },
  { value: 'mid',     label: 'Mid (2-5 yrs)' },
  { value: 'senior',  label: 'Senior (5-10 yrs)' },
  { value: 'lead',    label: 'Lead / Staff (10+ yrs)' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'open-to-work',        label: 'Open to Work' },
  { value: 'open-to-collaborate', label: 'Open to Collaborate' },
  { value: 'open-to-mentor',      label: 'Open to Mentor' },
  { value: 'not-available',       label: 'Not Available' },
];

export const WORK_PREFERENCES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

export function getDevDomainMeta(value) {
  return DEV_DOMAINS.find((d) => d.value === value);
}
