import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirebaseApp } from './app';

export async function signInWithGoogle() {
  const auth = getAuth(getFirebaseApp());
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user.getIdToken();
}
