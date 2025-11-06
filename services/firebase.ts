// Fix for: Module '"firebase/app"' has no exported member 'initializeApp'.
// Using a namespace import can resolve this issue in certain bundler/environment configurations.
import * as firebaseApp from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

// IMPORTANT: Replace with your own Firebase project configuration
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCTZP4xkhilSmrLgMTDB5BP-XZy3lq25U",
  authDomain: "perfect-productivity-d0272.firebaseapp.com",
  projectId: "perfect-productivity-d0272",
  storageBucket: "perfect-productivity-d0272.firebasestorage.app",
  messagingSenderId: "963675946258",
  appId: "1:963675946258:web:648aedbf80ead9c4e1c7cb",
  measurementId: "G-7NYTG3HRL8"
};


export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && !!firebaseConfig.apiKey;

let app;
let auth;
let db;
let provider;

if (isFirebaseConfigured) {
  app = firebaseApp.initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();
} else {
  console.warn("Firebase is not configured. Please add your Firebase project configuration to services/firebase.ts. The app will display a setup guide.");
}

const unconfiguredError = () => Promise.reject(new Error("Firebase is not configured. Please add your Firebase project configuration to services/firebase.ts"));

export const signInWithGoogle = () => {
  if (!isFirebaseConfigured || !auth || !provider) return unconfiguredError();
  return signInWithPopup(auth, provider);
};

export const signOutUser = () => {
  if (!isFirebaseConfigured || !auth) return unconfiguredError();
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Generic Firestore service functions
export const getCollection = async <T>(userId: string, collectionName: string): Promise<(T & {id: string})[]> => {
  if (!isFirebaseConfigured || !db || !userId) return [];
  const q = query(collection(db, `users/${userId}/${collectionName}`), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  // Fix for: Spread types may only be created from object types.
  // The non-null assertion operator (!) is used because QueryDocumentSnapshot.data() should always exist,
  // but TypeScript may incorrectly infer it as potentially undefined due to environment or typings issues.
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data()! } as T & {id: string}));
};

export const addDocument = async (userId: string, collectionName: string, data: object) => {
  if (!isFirebaseConfigured || !db || !userId) return unconfiguredError();
  return addDoc(collection(db, `users/${userId}/${collectionName}`), { ...data, createdAt: serverTimestamp() });
};

export const updateDocument = async (userId: string, collectionName: string, docId: string, data: object) => {
  if (!isFirebaseConfigured || !db || !userId) return unconfiguredError();
  const docRef = doc(db, `users/${userId}/${collectionName}`, docId);
  return updateDoc(docRef, data);
};

export const deleteDocument = async (userId: string, collectionName: string, docId: string) => {
  if (!isFirebaseConfigured || !db || !userId) return unconfiguredError();
  const docRef = doc(db, `users/${userId}/${collectionName}`, docId);
  return deleteDoc(docRef);
};

export { auth, db };