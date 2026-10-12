import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Demo mode: no Firebase config (public build) or explicitly requested
export const DEMO = import.meta.env.VITE_DEMO === 'true' || !firebaseConfig.apiKey

let app;
let auth;

if (!DEMO) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (e) {
        console.error("Firebase init error:", e);
    }
} else {
    // Demo visitor, always signed in
    const demoUser = { email: 'demo@canopee.app', uid: 'demo', getIdToken: async () => 'demo' }
    auth = {
        currentUser: demoUser,
        onAuthStateChanged: (cb) => { setTimeout(() => cb(demoUser), 0); return () => { } },
        signOut: async () => { }
    };
}

// Works with the real Firebase auth and with the demo one
export function watchAuth(cb) {
    return DEMO ? auth.onAuthStateChanged(cb) : onAuthStateChanged(auth, cb)
}

export { auth };
