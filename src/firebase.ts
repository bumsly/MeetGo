// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { OAuthProvider, getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB35-qrn7H4Q3Zt32ZMYLqbW1PWeUVAkU4",
  authDomain: "meetgo-1caa5.firebaseapp.com",
  projectId: "meetgo-1caa5",
  storageBucket: "meetgo-1caa5.firebasestorage.app",
  messagingSenderId: "1034129023463",
  appId: "1:1034129023463:web:7e0ec1ee34d6a265e21d42",
  measurementId: "G-TSXTB31WYY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const firestore = getFirestore(app);

export const kakaoprovider = new OAuthProvider("oidc.kakao");
