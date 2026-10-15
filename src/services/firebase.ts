import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import type { Attempt, SimulationSession } from '../domain/types';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseConfigured = Object.values(config).every(Boolean);
export const firebaseApp = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
export const firebaseAiConfigured = Boolean(firebaseApp && recaptchaSiteKey);

// Initialize App Check before Auth/Firestore so public AI requests carry an attestation.
if (firebaseApp && recaptchaSiteKey && typeof window !== 'undefined') {
  try {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch {
    // Hot reload may already have initialized App Check for this Firebase app.
  }
}

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;

export function observeAuth(callback: (user: User | null) => void): () => void {
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signInWithGoogle() {
  if (!firebaseAuth) throw new Error('A sincronização ainda não foi configurada.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(firebaseAuth, provider);
}

export async function signOutOfGoogle() {
  if (firebaseAuth) await signOut(firebaseAuth);
}

export async function loadCloudLearning(uid: string) {
  if (!firebaseApp) return { attempts: [] as Attempt[], simulations: [] as SimulationSession[] };
  return (await import('./firebase-learning')).loadCloudLearning(uid);
}

export async function saveCloudAttempt(uid: string, attempt: Attempt) {
  if (!firebaseApp) return;
  await (await import('./firebase-learning')).saveCloudAttempt(uid, attempt);
}

export async function saveCloudSimulation(uid: string, session: SimulationSession) {
  if (!firebaseApp) return;
  await (await import('./firebase-learning')).saveCloudSimulation(uid, session);
}

export async function syncLocalLearning(uid: string, attempts: Attempt[], simulations: SimulationSession[]) {
  if (!firebaseApp) return;
  await (await import('./firebase-learning')).syncLocalLearning(uid, attempts, simulations);
}

export function subscribeToCloudLearning(
  uid: string,
  handlers: {
    onAttempts: (attempts: Attempt[]) => void;
    onSimulations: (sessions: SimulationSession[]) => void;
    onError: () => void;
  }
) {
  if (!firebaseApp) return () => {};
  let cancelled = false;
  let stop = () => {};
  void import('./firebase-learning').then((cloud) => {
    if (!cancelled) stop = cloud.subscribeToCloudLearning(uid, handlers);
  }).catch(handlers.onError);
  return () => {
    cancelled = true;
    stop();
  };
}

export { onAuthStateChanged, type User };
