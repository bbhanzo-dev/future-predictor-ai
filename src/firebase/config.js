import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * [IMPORTANT] Replace these values with your actual Firebase project config.
 * You can find this in Firebase Console -> Project Settings -> General -> Your apps.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBs8RdcaPqDISPbkVzU3LtTKdzWCzJZ_Yk",
  authDomain: "future-predictor-ai.firebaseapp.com",
  databaseURL: "https://future-predictor-ai-default-rtdb.firebaseio.com",
  projectId: "future-predictor-ai",
  storageBucket: "future-predictor-ai.firebasestorage.app",
  messagingSenderId: "638340843573",
  appId: "1:638340843573:web:36f09d753cd40c64ed897c",
  measurementId: "G-PQKTC4F9V2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
