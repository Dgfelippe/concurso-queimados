import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import type { Attempt, SimulationSession } from '../domain/types';

const firestore = firebaseApp ? getFirestore(firebaseApp) : null;
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
