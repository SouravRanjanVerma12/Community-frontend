import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import OnboardingModal from './OnboardingModal';

export default function OnboardingGate() {
  const { user, accessToken } = useAuthStore();
  const show = Boolean(user && accessToken && !user.onboarded);

  return (
    <AnimatePresence>
      {show && <OnboardingModal key="onboarding" />}
    </AnimatePresence>
  );
}
