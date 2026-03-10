import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqkKI_rgsHIQM1PlGKHYJhzsEMbGbjVzM",
  authDomain: "fernadastore-a5649.firebaseapp.com",
  projectId: "fernadastore-a5649",
  storageBucket: "fernadastore-a5649.firebasestorage.app",
  messagingSenderId: "163273304336",
  appId: "1:163273304336:web:ad4fac2e6e9dd8aacd5d95",
  measurementId: "G-D7K2671Z1M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
