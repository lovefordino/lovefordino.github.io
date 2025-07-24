// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBcuyoGx61Y_bnn5yZzN-2QoWTwNjfHu4",
  authDomain: "lovefordino-e3ad1.firebaseapp.com",
  projectId: "lovefordino-e3ad1",
  storageBucket: "lovefordino-e3ad1.firebasestorage.app",
  messagingSenderId: "286337077088",
  appId: "1:286337077088:web:95e228c8993734fdb39805"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);      // Firestore DB
export const storage = getStorage(app);   // Storage