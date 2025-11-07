import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZpn1jUHZ4vvNuyTpz_UwsD5_yJxdlCt0",
  authDomain: "ticket-gen-6fae3.firebaseapp.com",
  projectId: "ticket-gen-6fae3",
  storageBucket: "ticket-gen-6fae3.firebasestorage.app",
  messagingSenderId: "1089406666585",
  appId: "1:1089406666585:web:1a1c0b9cf86736303eae48",
  measurementId: "G-KKVQ67V9W9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
