import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import OnboardingModal from './OnboardingModal';

export default function OnboardingGate() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleRequired = () => setShow(true);
    window.addEventListener('LINKEDIN_IMPORT_REQUIRED', handleRequired);
    return () => window.removeEventListener('LINKEDIN_IMPORT_REQUIRED', handleRequired);
  }, []);

  useEffect(() => {
    if (user?.linkedinImported) setShow(false);
  }, [user?.linkedinImported]);

  return (
    <AnimatePresence>
      {show && <OnboardingModal onClose={() => setShow(false)} />}
    </AnimatePresence>
  );
}
