import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB0Aq0grBwwmS9duFL_iYxfQTpi8z3maHs",
  authDomain: "theheartcloud-a11a0.firebaseapp.com",
  projectId: "theheartcloud-a11a0",
  storageBucket: "theheartcloud-a11a0.firebasestorage.app",
  messagingSenderId: "999053174809",
  appId: "1:999053174809:web:51d93e4993675b28f06288",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;