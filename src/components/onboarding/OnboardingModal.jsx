import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, UploadCloud, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';

export default function OnboardingModal({ onClose }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.zip')) {
      setFile(selected);
      setError('');
    } else if (selected) {
      setError('Please select a valid .zip file.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post('/users/linkedin-import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.user);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process the ZIP file. Please ensure it is the correct export from LinkedIn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="w-full max-w-[480px] bg-card rounded-[24px] shadow-2xl border border-border/50 p-6 flex flex-col gap-5"
      >
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Import your Professional Data</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            To maintain high signal quality in the hub, we require importing your verified LinkedIn data export before you can interact with the community.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-[10px] bg-error-bg border border-error-border text-error text-sm leading-normal">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center text-center">
          <UploadCloud className="text-text-muted mb-3" size={36} />
          <p className="text-sm text-text-primary font-medium mb-1">
            {file ? file.name : 'Upload LinkedIn Data Export (.zip)'}
          </p>
          <p className="text-xs text-text-muted mb-4 max-w-[280px]">
            Request a data archive containing your Profile, Education, Skills, and Positions from your LinkedIn settings.
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            <span className="inline-flex items-center justify-center h-10 px-4 bg-input border border-border rounded-lg text-sm font-medium hover:bg-hover transition-colors">
              Select ZIP file
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {onClose && (
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          )}
          <Button onClick={handleUpload} isLoading={loading} disabled={!file}>
            Import Data
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
