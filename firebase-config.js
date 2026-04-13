

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDIdOyW4TfGO4K0hdOA4_drvYPZ_-FywG0",
  authDomain: "cloutiva-app.firebaseapp.com",
  projectId: "cloutiva-app",
  storageBucket: "cloutiva-app.firebasestorage.app",
  messagingSenderId: "898248697277",
  appId: "1:898248697277:web:8bcdeabc3c91618ae15ed4",
  measurementId: "G-JTCSKX7FG5"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
