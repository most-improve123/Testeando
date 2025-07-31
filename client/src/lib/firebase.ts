import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Types for Firebase documents
export interface FirebaseCertificate {
  id: string;
  nombre: string;
  curso: string;
  fecha: string;
  hash: string;
  certificateId: string;
  userId?: number;
  courseId?: number;
}

// Generate SHA-256 hash
export async function generateHash(text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Save certificate to Firebase
export async function saveCertificateToFirebase(certificate: FirebaseCertificate): Promise<void> {
  try {
    await addDoc(collection(db, "certificados"), certificate);
    console.log("Certificate saved to Firebase with ID:", certificate.id);
  } catch (error) {
    console.error("Error saving certificate to Firebase:", error);
    throw error;
  }
}

// Verify certificate by ID or hash
export async function verifyCertificateFromFirebase(idOrHash: string): Promise<FirebaseCertificate | null> {
  try {
    // Search by certificateId first
    let q = query(collection(db, "certificados"), where("certificateId", "==", idOrHash));
    let querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data() } as FirebaseCertificate;
    }

    // Search by id if not found
    q = query(collection(db, "certificados"), where("id", "==", idOrHash));
    querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data() } as FirebaseCertificate;
    }

    // Search by hash if not found
    q = query(collection(db, "certificados"), where("hash", "==", idOrHash));
    querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { ...doc.data() } as FirebaseCertificate;
    }

    return null;
  } catch (error) {
    console.error("Error verifying certificate:", error);
    throw error;
  }
}