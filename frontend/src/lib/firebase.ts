import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if we have enough config to initialize Firebase (e.g. client side or build time with env vars)
const hasConfig = typeof window !== 'undefined' || !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize Firebase only once
const app = hasConfig
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

const auth = (app ? getAuth(app) : null) as Auth;

// Get Realtime Database instance
const database = (app ? getDatabase(app) : null) as Database;

let authReadyPromise: Promise<void> | null = null;

async function ensureFirebaseAuth() {
  if (!auth) return null;

  if (!authReadyPromise) {
    authReadyPromise = (async () => {
      await auth.authStateReady();

      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      await auth.authStateReady();
    })().catch((err) => {
      authReadyPromise = null;
      throw err;
    });
  }

  await authReadyPromise;
  return auth.currentUser;
}

export { app, auth, database, ensureFirebaseAuth };
