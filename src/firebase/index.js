// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkmVtQf7aOVRBjIw_AQQyfWHmVyBXxigg",
  authDomain: "theheartcloud-pruebas.firebaseapp.com",
  projectId: "theheartcloud-pruebas",
  storageBucket: "theheartcloud-pruebas.firebasestorage.app",
  messagingSenderId: "728105028089",
  appId: "1:728105028089:web:28c5ae8ae6299c0a8cd528"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;