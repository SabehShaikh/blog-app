import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { doc, setDoc, getFirestore, getDoc , updateDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyBHO2psCdz8PwHkXtN293GEq5MhsZ02UD8",
    authDomain: "hackathon-9eef8.firebaseapp.com",
    projectId: "hackathon-9eef8",
    storageBucket: "hackathon-9eef8.appspot.com",
    messagingSenderId: "771294258194",
    appId: "1:771294258194:web:4a130d2835604d1655a4cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, db, getDoc , updateDoc };