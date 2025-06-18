
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCdlz86p-clfecHYPMzypl04KLYAN6JUE",
  authDomain: "palette-pro-ebcec.firebaseapp.com",
  projectId: "palette-pro-ebcec",
  storageBucket: "palette-pro-ebcec.firebasestorage.app",
  messagingSenderId: "97928250759",
  appId: "1:97928250759:web:ec9afb076537197c2e7f22",
  measurementId: "G-WMXMHCG4LH"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Firebase Analytics could not be initialized (possibly already initialized):", e);
    }
  }
}

export { app, auth, db, analytics };
