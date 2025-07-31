import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface FirebaseCertificate {
  id: string;
  certificateId: string;
  nombre: string;
  curso: string;
  fecha: string;
  hash: string;
  userId?: number;
  courseId?: number;
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