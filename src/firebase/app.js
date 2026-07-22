import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

export function getFirebaseApp() {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}
