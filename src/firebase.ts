import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAjWzt5zD8YE6nW_D3EQc0m1tqnm-uvKFk",
  authDomain: "vix-es.firebaseapp.com",
  projectId: "vix-es",
  storageBucket: "vix-es.firebasestorage.app",
  messagingSenderId: "615029432446",
  appId: "1:615029432446:web:288765071b340d86dbb82f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
