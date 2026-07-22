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

  // Prompt once right after login/session restore, rather than waiting for
  // the user to hit a gated action. Keyed on user id so it fires once per
  // session, not on every profile field edit.
  useEffect(() => {
    if (!user?._id || user.linkedinImported || user.profileCompleted) return;
    setShow(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (user?.linkedinImported || user?.profileCompleted) setShow(false);
  }, [user?.linkedinImported, user?.profileCompleted]);

  return (
    <AnimatePresence>
      {show && <OnboardingModal onClose={() => setShow(false)} />}
    </AnimatePresence>
  );
}
