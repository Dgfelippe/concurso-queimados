import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  type Unsubscribe
} from 'firebase/firestore';
import type { Attempt, SimulationSession } from '../domain/types';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseConfigured = Object.values(config).every(Boolean);
const app = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(config)) : null;
export const firebaseAuth = app ? getAuth(app) : null;
export const firestore = app ? getFirestore(app) : null;

export function observeAuth(callback: (user: User | null) => void): Unsubscribe | (() => void) {
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

const userCollection = (uid: string, name: 'attempts' | 'simulations') =>
  collection(firestore!, 'users', uid, name);

export async function loadCloudLearning(uid: string) {
  if (!firestore) return { attempts: [] as Attempt[], simulations: [] as SimulationSession[] };
  const [attempts, simulations] = await Promise.all([
    getDocs(userCollection(uid, 'attempts')),
    getDocs(userCollection(uid, 'simulations'))
  ]);
  return {
    attempts: attempts.docs.map((item) => item.data() as Attempt),
    simulations: simulations.docs.map((item) => item.data() as SimulationSession)
  };
}

export async function saveCloudAttempt(uid: string, attempt: Attempt) {
  if (!firestore) return;
  await setDoc(doc(firestore, 'users', uid, 'attempts', attempt.id), attempt, { merge: true });
}

export async function saveCloudSimulation(uid: string, session: SimulationSession) {
  if (!firestore) return;
  await setDoc(doc(firestore, 'users', uid, 'simulations', session.id), session, { merge: true });
}

export async function syncLocalLearning(uid: string, attempts: Attempt[], simulations: SimulationSession[]) {
  if (!firestore) return;
  await Promise.all([
    ...attempts.map((attempt) => saveCloudAttempt(uid, attempt)),
    ...simulations.map((session) => saveCloudSimulation(uid, session))
  ]);
}

export function subscribeToCloudLearning(
  uid: string,
  handlers: {
    onAttempts: (attempts: Attempt[]) => void;
    onSimulations: (sessions: SimulationSession[]) => void;
    onError: () => void;
  }
) {
  if (!firestore) return () => {};
  const stopAttempts = onSnapshot(userCollection(uid, 'attempts'),
    (snapshot) => handlers.onAttempts(snapshot.docs.map((item) => item.data() as Attempt)),
    handlers.onError);
  const stopSimulations = onSnapshot(userCollection(uid, 'simulations'),
    (snapshot) => handlers.onSimulations(snapshot.docs.map((item) => item.data() as SimulationSession)),
    handlers.onError);
  return () => {
    stopAttempts();
    stopSimulations();
  };
}

export { onAuthStateChanged, type User };
